import { prisma } from "@sports-booking-platform/db";
import {
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
} from "@sports-booking-platform/validation/pricing_rule.schema";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { parseTime } from "../../helpers";
import { updateComplexCache } from "../../helpers/complexCache";

export const createPricingRule = async (
  ownerId: string,
  data: CreatePricingRuleInput
) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });
  if (!owner) {
    throw new ForbiddenError("Only owners can create pricing rules");
  }
  // Kiểm tra quyền sở hữu SubField
  const subField = await prisma.subField.findUnique({
    where: { id: data.sub_field_id },
    include: {
      complex: true,
    },
  });

  if (!subField) {
    throw new NotFoundError("Sub-field not found");
  }

  if (subField.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this sub-field"
    );
  }

  //danh sách rule hợp lệ
  const rulesToCreate = [];

  //duyet tung ngay duoc chon
  for (const day of data.day_of_week) {
    //duyet tung khung gio duoc chon
    for (const slot of data.time_slots) {
      const startTime = parseTime(slot.start_time);
      const endTime = parseTime(slot.end_time);

      if (startTime >= endTime) {
        throw new BadRequestError("Start time must be before end time");
      }

      // Kiểm tra trùng lặp với các luật giá hiện có
      const overlappingRule = await prisma.pricingRule.findFirst({
        where: {
          sub_field_id: data.sub_field_id,
          day_of_week: day,
          AND: [
            {
              start_time: { lt: endTime },
            },
            {
              end_time: { gt: startTime },
            },
          ],
        },
      });

      if (overlappingRule) {
        throw new BadRequestError(
          `Pricing rule overlaps with existing rule on day ${day} from ${overlappingRule.start_time} to ${overlappingRule.end_time}`
        );
      }

      // Thêm luật giá hợp lệ vào danh sách
      rulesToCreate.push({
        sub_field_id: data.sub_field_id,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        base_price: data.base_price,
      });
    }
  }

  // Tạo luật giá mới
  if (rulesToCreate.length === 0) {
    throw new BadRequestError("No valid pricing rules to create");
  }

  const createdRules = await prisma.$transaction(
    rulesToCreate.map((rule) =>
      prisma.pricingRule.create({
        data: rule,
      })
    )
  );

  // Update complex cache after creating pricing rules
  const complexId = subField.complex.id;
  await updateComplexCache(complexId);

  return createdRules;
};

export const getOwnerPricingRulesByDay = async (
  ownerId: string,
  subFieldId: string,
  dayOfWeek: number
) => {
  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      sub_field_id: subFieldId,
      sub_field: {
        complex: {
          owner_id: ownerId,
        },
      },
      day_of_week: dayOfWeek,
    },
    select: {
      id: true,
      day_of_week: true,
      start_time: true,
      end_time: true,
      base_price: true,
    },
    orderBy: { start_time: "asc" },
  });

  return pricingRules;
};

export const updatePricingRule = async (
  ownerId: string,
  pricingRuleId: string,
  data: UpdatePricingRuleInput
) => {
  // lấy rule hiện tại
  const existingRule = await prisma.pricingRule.findUnique({
    where: { id: pricingRuleId, day_of_week: data.day_of_week },
    include: {
      sub_field: {
        include: {
          complex: {
            select: { id: true, owner_id: true },
          },
        },
      },
    },
  });

  if (!existingRule) {
    throw new NotFoundError("Pricing rule not found");
  }

  //check quyền sở hữu
  if (existingRule.sub_field.complex.owner_id !== ownerId) {
    throw new ForbiddenError("You do not have permission to update this rule");
  }

  // chuẩn bị dữ liệu để validate
  const nextStartTime = data.start_time
    ? parseTime(data.start_time)
    : existingRule.start_time;

  const nextEndTime = data.end_time
    ? parseTime(data.end_time)
    : existingRule.end_time;

  // logic thời gian
  if (nextStartTime >= nextEndTime) {
    throw new BadRequestError("Start time must be before end time");
  }

  // check trùng lặp (Chỉ check nếu có thay đổi về giờ hoặc ngày)
  const isTimeChanged = data.start_time || data.end_time;

  if (isTimeChanged) {
    const overlappingRule = await prisma.pricingRule.findFirst({
      where: {
        sub_field_id: data.sub_field_id,
        day_of_week: data.day_of_week,
        AND: [
          { start_time: { lt: nextEndTime } },
          { end_time: { gt: nextStartTime } },
        ],
        id: { not: pricingRuleId },
      },
    });

    if (overlappingRule) {
      throw new BadRequestError(
        `Update failed: Overlaps with existing rule on day ${data.day_of_week} from ${overlappingRule.start_time} to ${overlappingRule.end_time}`
      );
    }
  }

  // update vào DB
  const updatedPricingRule = await prisma.pricingRule.update({
    where: { id: pricingRuleId },
    data: {
      // chỉ update những trường có gửi lên (undefined Prisma sẽ bỏ qua)
      day_of_week: data.day_of_week,
      start_time: data.start_time ? nextStartTime : undefined,
      end_time: data.end_time ? nextEndTime : undefined,
      base_price: data.base_price,
    },
  });

  // Update complex cache after updating pricing rule
  const complexId = existingRule.sub_field.complex.id;
  await updateComplexCache(complexId);

  return updatedPricingRule;
};

export const deletePricingRule = async (
  ownerId: string,
  pricingRuleId: string
) => {
  // Kiểm tra quyền sở hữu PricingRule qua SubField -> Complex -> Owner
  const pricingRule = await prisma.pricingRule.findUnique({
    where: { id: pricingRuleId },
    include: {
      sub_field: {
        include: {
          complex: {
            select: { id: true, owner_id: true },
          },
        },
      },
    },
  });

  if (!pricingRule) {
    throw new NotFoundError("Pricing rule not found");
  }

  if (pricingRule.sub_field.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this pricing rule"
    );
  }

  // Xoá luật giá
  await prisma.pricingRule.delete({
    where: { id: pricingRuleId },
  });

  // Update complex cache after deleting pricing rule
  const complexId = pricingRule.sub_field.complex.id;
  await updateComplexCache(complexId);
};

// Bulk delete pricing rules
export const bulkDeletePricingRules = async (
  ownerId: string,
  pricingRuleIds: string[]
) => {
  if (!pricingRuleIds || pricingRuleIds.length === 0) {
    throw new BadRequestError("No pricing rule IDs provided");
  }

  // Lấy tất cả pricing rules và check ownership
  const pricingRules = await prisma.pricingRule.findMany({
    where: {
      id: { in: pricingRuleIds },
    },
    include: {
      sub_field: {
        include: {
          complex: {
            select: { id: true, owner_id: true },
          },
        },
      },
    },
  });

  // Check nếu không tìm thấy rules
  if (pricingRules.length === 0) {
    throw new NotFoundError("No pricing rules found");
  }

  // Check ownership cho tất cả rules
  const unauthorizedRules = pricingRules.filter(
    (rule) => rule.sub_field.complex.owner_id !== ownerId
  );

  if (unauthorizedRules.length > 0) {
    throw new ForbiddenError(
      "You do not have permission to delete some of these pricing rules"
    );
  }

  // Xóa tất cả pricing rules
  await prisma.pricingRule.deleteMany({
    where: {
      id: { in: pricingRuleIds },
    },
  });

  // Update complex cache for affected complexes (get unique complex IDs)
  const affectedComplexIds = [
    ...new Set(pricingRules.map((rule) => rule.sub_field.complex.id)),
  ];
  await Promise.all(
    affectedComplexIds.map((complexId) => updateComplexCache(complexId))
  );

  return { deletedCount: pricingRules.length };
};

// Copy pricing rules from one day to another
export const copyPricingRules = async (
  ownerId: string,
  subFieldId: string,
  sourceDayOfWeek: number,
  targetDaysOfWeek: number[]
) => {
  // Validate days
  if (sourceDayOfWeek < 0 || sourceDayOfWeek > 6) {
    throw new BadRequestError("Invalid source day of week (0-6)");
  }

  if (
    !targetDaysOfWeek ||
    targetDaysOfWeek.length === 0 ||
    targetDaysOfWeek.some((day) => day < 0 || day > 6)
  ) {
    throw new BadRequestError("Invalid target days of week (0-6)");
  }

  // Check ownership
  const subField = await prisma.subField.findUnique({
    where: { id: subFieldId },
    include: {
      complex: true,
    },
  });

  if (!subField) {
    throw new NotFoundError("Sub-field not found");
  }

  if (subField.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this sub-field"
    );
  }

  // Lấy pricing rules từ ngày nguồn
  const sourceRules = await prisma.pricingRule.findMany({
    where: {
      sub_field_id: subFieldId,
      day_of_week: sourceDayOfWeek,
    },
    select: {
      start_time: true,
      end_time: true,
      base_price: true,
    },
  });

  if (sourceRules.length === 0) {
    throw new NotFoundError(
      `No pricing rules found for source day ${sourceDayOfWeek}`
    );
  }

  // Xóa các rules cũ ở target days (nếu có)
  await prisma.pricingRule.deleteMany({
    where: {
      sub_field_id: subFieldId,
      day_of_week: { in: targetDaysOfWeek },
    },
  });

  // Tạo rules mới cho target days
  const newRules = targetDaysOfWeek.flatMap((targetDay) =>
    sourceRules.map((rule) => ({
      sub_field_id: subFieldId,
      day_of_week: targetDay,
      start_time: rule.start_time,
      end_time: rule.end_time,
      base_price: rule.base_price,
    }))
  );

  const createdRules = await prisma.$transaction(
    newRules.map((rule) =>
      prisma.pricingRule.create({
        data: rule,
      })
    )
  );

  // Update complex cache after copying pricing rules
  const complexId = subField.complex.id;
  await updateComplexCache(complexId);

  return {
    copiedFrom: sourceDayOfWeek,
    copiedTo: targetDaysOfWeek,
    rulesCreated: createdRules.length,
  };
};
