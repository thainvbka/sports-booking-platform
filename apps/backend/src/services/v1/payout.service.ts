import { prisma } from "../../libs/prisma";
import { PayoutStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../utils/error.response";
import { sendNotificationIfNotExists } from "./notification.service";

/**
 * Lấy thông tin ví và số dư của Owner
 */
export const getOwnerWallet = async (ownerId: string) => {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
    select: {
      id: true,
      bank_name: true,
      bank_account_number: true,
      bank_account_name: true,
      bank_branch: true,
    },
  });

  if (!owner) {
    throw new NotFoundError("Owner profile not found");
  }

  // Lấy các thống kê số dư
  const payouts = await prisma.ownerPayout.findMany({
    where: { owner_id: ownerId },
    select: {
      status: true,
      payout_amount: true,
    },
  });

  let balancePending = 0;   // Đang tích lũy, chưa rút
  let balanceRequested = 0; // Đã gửi yêu cầu rút, chờ duyệt
  let balancePaid = 0;      // Đã được chuyển khoản thành công

  for (const payout of payouts) {
    const amount = Number(payout.payout_amount);
    if (payout.status === PayoutStatus.PENDING) {
      balancePending += amount;
    } else if (
      payout.status === PayoutStatus.REQUESTED ||
      payout.status === PayoutStatus.PROCESSING
    ) {
      balanceRequested += amount;
    } else if (payout.status === PayoutStatus.PAID) {
      balancePaid += amount;
    }
  }

  // Lấy lịch sử các đợt rút tiền (PayoutBatch)
  const batches = await prisma.payoutBatch.findMany({
    where: { owner_id: ownerId },
    orderBy: { created_at: "desc" },
    include: {
      payouts: {
        select: {
          id: true,
          total_amount: true,
          platform_fee: true,
          payout_amount: true,
          created_at: true,
        },
      },
    },
  });

  return {
    bankDetails: {
      bank_name: owner.bank_name,
      bank_account_number: owner.bank_account_number,
      bank_account_name: owner.bank_account_name,
      bank_branch: owner.bank_branch,
    },
    balances: {
      pending: balancePending,
      requested: balanceRequested,
      paid: balancePaid,
    },
    batches,
  };
};

/**
 * Cập nhật thông tin tài khoản ngân hàng nội địa cho Owner
 */
export const updateOwnerBankDetails = async (
  ownerId: string,
  bankDetails: {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    bank_branch?: string;
  },
) => {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
  });

  if (!owner) {
    throw new NotFoundError("Owner profile not found");
  }

  const updatedOwner = await prisma.owner.update({
    where: { id: ownerId },
    data: {
      bank_name: bankDetails.bank_name,
      bank_account_number: bankDetails.bank_account_number,
      bank_account_name: bankDetails.bank_account_name,
      bank_branch: bankDetails.bank_branch || null,
    },
    select: {
      bank_name: true,
      bank_account_number: true,
      bank_account_name: true,
      bank_branch: true,
    },
  });

  return updatedOwner;
};

/**
 * Owner gửi yêu cầu rút tiền (Gom toàn bộ các OwnerPayout PENDING thành 1 PayoutBatch)
 */
export const requestOwnerPayout = async (ownerId: string) => {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId, status: "ACTIVE" },
  });

  if (!owner) {
    throw new NotFoundError("Owner profile not found");
  }

  // Ràng buộc: Bắt buộc cấu hình ngân hàng trước khi rút tiền
  if (!owner.bank_name || !owner.bank_account_number || !owner.bank_account_name) {
    throw new BadRequestError(
      "Vui lòng cấu hình đầy đủ thông tin tài khoản ngân hàng nhận tiền trước khi gửi yêu cầu.",
    );
  }

  // Dùng transaction để khóa bản ghi và tránh race conditions
  const result = await prisma.$transaction(async (tx) => {
    // Khóa các OwnerPayout PENDING để tránh double-request
    const pendingPayouts = await tx.$queryRaw<any[]>`
      SELECT id, payout_amount FROM "OwnerPayout"
      WHERE owner_id = ${ownerId}::uuid AND status = 'PENDING'::"PayoutStatus"
      FOR UPDATE
    `;

    if (pendingPayouts.length === 0) {
      throw new BadRequestError("Bạn không có số dư khả dụng (PENDING) để thực hiện rút tiền.");
    }

    // Tính tổng số tiền rút
    const totalPayout = pendingPayouts.reduce(
      (sum, p) => sum + Number(p.payout_amount),
      0,
    );

    // Tạo PayoutBatch
    const date = new Date();
    const period = `Yêu cầu rút tiền ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    const batch = await tx.payoutBatch.create({
      data: {
        owner_id: ownerId,
        total_payout: totalPayout,
        status: PayoutStatus.REQUESTED,
        payout_period: period,
      },
    });

    // Cập nhật trạng thái của các OwnerPayout liên quan
    const payoutIds = pendingPayouts.map((p) => p.id);
    await tx.ownerPayout.updateMany({
      where: {
        id: { in: payoutIds },
        status: PayoutStatus.PENDING,
      },
      data: {
        status: PayoutStatus.REQUESTED,
        batch_id: batch.id,
      },
    });

    return { batch, totalPayout };
  });

  // Gửi Notification Real-time (không chặn luồng giao dịch tài chính)
  try {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(result.totalPayout);

    // 1. Thông báo cho Owner
    await sendNotificationIfNotExists(owner.account_id, {
      message: `Yêu cầu rút tiền trị giá ${formattedAmount} đã được gửi thành công. Trạng thái: Chờ duyệt.`,
      type: "SYSTEM",
      target_role: "OWNER",
      link_to: "/owner/wallet",
    });

    // 2. Thông báo cho tất cả các Admin hệ thống
    const admins = await prisma.admin.findMany({
      where: { status: "ACTIVE" },
      select: { account_id: true },
    });

    for (const admin of admins) {
      await sendNotificationIfNotExists(admin.account_id, {
        message: `Chủ sân ${owner.company_name} vừa gửi yêu cầu quyết toán VNPAY mới trị giá ${formattedAmount}.`,
        type: "SYSTEM",
        target_role: "ADMIN",
        link_to: "/admin/payouts",
      });
    }
  } catch (err) {
    console.error("[Notification] Failed to send request payout notifications:", err);
  }

  return result.batch;
};

/**
 * Admin lấy danh sách các yêu cầu Payout
 */
export const adminGetPayoutBatches = async (status?: PayoutStatus) => {
  const filter = status ? { status } : {};

  const batches = await prisma.payoutBatch.findMany({
    where: filter,
    orderBy: { created_at: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          company_name: true,
          bank_name: true,
          bank_account_number: true,
          bank_account_name: true,
          bank_branch: true,
          account: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone_number: true,
            },
          },
        },
      },
      payouts: {
        select: {
          id: true,
          total_amount: true,
          platform_fee: true,
          payout_amount: true,
          created_at: true,
        },
      },
    },
  });

  return batches;
};

/**
 * Admin chuyển yêu cầu Payout sang PROCESSING (Bắt đầu xử lý)
 */
export const adminProcessPayoutBatch = async (batchId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    // Pessimistic Lock on PayoutBatch
    const lockedBatches = await tx.$queryRaw<any[]>`
      SELECT pb.status, pb.total_payout, pb.created_at, o.account_id 
      FROM "PayoutBatch" pb
      JOIN "Owner" o ON o.id = pb.owner_id
      WHERE pb.id = ${batchId}::uuid 
      FOR UPDATE
    `;

    if (lockedBatches.length === 0) {
      throw new NotFoundError("Payout batch not found");
    }

    const batch = lockedBatches[0];
    if (batch.status !== PayoutStatus.REQUESTED) {
      throw new BadRequestError("Chỉ có thể xử lý yêu cầu rút tiền ở trạng thái REQUESTED.");
    }

    const updated = await tx.payoutBatch.update({
      where: { id: batchId },
      data: { status: PayoutStatus.PROCESSING },
    });

    await tx.ownerPayout.updateMany({
      where: { batch_id: batchId, status: PayoutStatus.REQUESTED },
      data: { status: PayoutStatus.PROCESSING },
    });

    return { updated, accountId: batch.account_id, totalPayout: batch.total_payout, createdAt: batch.created_at };
  });

  // Gửi Notification báo cho Owner
  try {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(result.totalPayout));

    await sendNotificationIfNotExists(result.accountId, {
      message: `Yêu cầu rút tiền ngày ${new Date(result.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} trị giá ${formattedAmount} của bạn đã được Admin chuyển sang trạng thái: ĐANG XỬ LÝ.`,
      type: "SYSTEM",
      target_role: "OWNER",
      link_to: "/owner/wallet",
    });
  } catch (err) {
    console.error("[Notification] Failed to send process payout notification:", err);
  }

  return result.updated;
};

/**
 * Admin phê duyệt Payout (Đã chuyển khoản thành công, điền mã giao dịch và ảnh UNC)
 */
export const adminApprovePayoutBatch = async (
  batchId: string,
  data: {
    transaction_ref: string;
    note?: string;
  },
) => {
  const result = await prisma.$transaction(async (tx) => {
    // Pessimistic Lock on PayoutBatch
    const lockedBatches = await tx.$queryRaw<any[]>`
      SELECT pb.status, pb.total_payout, o.account_id 
      FROM "PayoutBatch" pb
      JOIN "Owner" o ON o.id = pb.owner_id
      WHERE pb.id = ${batchId}::uuid 
      FOR UPDATE
    `;

    if (lockedBatches.length === 0) {
      throw new NotFoundError("Payout batch not found");
    }

    const batch = lockedBatches[0];
    if (batch.status !== PayoutStatus.PROCESSING && batch.status !== PayoutStatus.REQUESTED) {
      throw new BadRequestError("Yêu cầu rút tiền phải ở trạng thái REQUESTED hoặc PROCESSING để phê duyệt.");
    }

    // Cập nhật PayoutBatch
    const updatedBatch = await tx.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: PayoutStatus.PAID,
        paid_at: new Date(),
        transaction_ref: data.transaction_ref,
        note: data.note || null,
      },
    });

    // Cập nhật các OwnerPayout liên quan
    await tx.ownerPayout.updateMany({
      where: { batch_id: batchId },
      data: {
        status: PayoutStatus.PAID,
        paid_at: new Date(),
      },
    });

    return { updatedBatch, accountId: batch.account_id, totalPayout: batch.total_payout };
  });

  // Gửi Notification báo cho Owner
  try {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(result.totalPayout));

    await sendNotificationIfNotExists(result.accountId, {
      message: `Chúc mừng! Yêu cầu rút tiền trị giá ${formattedAmount} đã được duyệt và CHUYỂN KHOẢN THÀNH CÔNG. Mã GD: ${data.transaction_ref}.`,
      type: "SYSTEM",
      target_role: "OWNER",
      link_to: "/owner/wallet",
    });
  } catch (err) {
    console.error("[Notification] Failed to send approve payout notification:", err);
  }

  return result.updatedBatch;
};

/**
 * Admin hủy/từ chối Payout (Hoàn trả các Payout nợ về PENDING để chủ sân rút lại sau)
 */
export const adminCancelPayoutBatch = async (batchId: string, note?: string) => {
  const result = await prisma.$transaction(async (tx) => {
    // Pessimistic Lock on PayoutBatch
    const lockedBatches = await tx.$queryRaw<any[]>`
      SELECT pb.status, pb.total_payout, o.account_id 
      FROM "PayoutBatch" pb
      JOIN "Owner" o ON o.id = pb.owner_id
      WHERE pb.id = ${batchId}::uuid 
      FOR UPDATE
    `;

    if (lockedBatches.length === 0) {
      throw new NotFoundError("Payout batch not found");
    }

    const batch = lockedBatches[0];
    if (batch.status === PayoutStatus.PAID) {
      throw new BadRequestError("Không thể từ chối yêu cầu rút tiền đã được thanh toán (PAID).");
    }

    // Cập nhật PayoutBatch
    const updatedBatch = await tx.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: PayoutStatus.CANCELLED,
        note: note || "Từ chối bởi Admin",
      },
    });

    // Trả các OwnerPayout về PENDING và tháo batch_id
    await tx.ownerPayout.updateMany({
      where: {
        batch_id: batchId,
        status: { in: [PayoutStatus.REQUESTED, PayoutStatus.PROCESSING] },
      },
      data: {
        status: PayoutStatus.PENDING,
        batch_id: null,
      },
    });

    return { updatedBatch, accountId: batch.account_id, totalPayout: batch.total_payout };
  });

  // Gửi Notification báo từ chối cho Owner
  try {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(result.totalPayout));

    await sendNotificationIfNotExists(result.accountId, {
      message: `Yêu cầu rút tiền trị giá ${formattedAmount} đã BỊ TỪ CHỐI bởi Admin. Lý do: ${note || "Vui lòng liên hệ Admin để biết thêm chi tiết"}. Số dư đã được hoàn lại ví của bạn.`,
      type: "SYSTEM",
      target_role: "OWNER",
      link_to: "/owner/wallet",
    });
  } catch (err) {
    console.error("[Notification] Failed to send cancel payout notification:", err);
  }

  return result.updatedBatch;
};

/**
 * Admin lấy danh sách ví và số dư của tất cả Owner trong hệ thống
 */
export const adminGetOwnerWallets = async () => {
  const owners = await prisma.owner.findMany({
    orderBy: { company_name: "asc" },
    include: {
      account: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone_number: true,
        },
      },
      payouts: {
        select: {
          status: true,
          payout_amount: true,
        },
      },
    },
  });

  return owners.map((owner) => {
    let pending = 0;
    let requested = 0;
    let paid = 0;

    for (const payout of owner.payouts) {
      const amount = Number(payout.payout_amount);
      if (payout.status === PayoutStatus.PENDING) {
        pending += amount;
      } else if (
        payout.status === PayoutStatus.REQUESTED ||
        payout.status === PayoutStatus.PROCESSING
      ) {
        requested += amount;
      } else if (payout.status === PayoutStatus.PAID) {
        paid += amount;
      }
    }

    return {
      id: owner.id,
      company_name: owner.company_name,
      bankDetails: {
        bank_name: owner.bank_name,
        bank_account_number: owner.bank_account_number,
        bank_account_name: owner.bank_account_name,
        bank_branch: owner.bank_branch,
      },
      balances: {
        pending,
        requested,
        paid,
      },
      account: owner.account,
    };
  });
};

