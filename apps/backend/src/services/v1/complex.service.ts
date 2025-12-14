import { prisma } from "@sports-booking-platform/db";
import {
  CreateComplexInput,
  UpdateComplexInput,
} from "@sports-booking-platform/validation/complex.schema";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { uploadComplexImages } from "../../helpers";

interface CreateComplexData extends CreateComplexInput {
  files: { [fieldname: string]: Express.Multer.File[] };
}

/**
 * OWNER SERVICES
 */

export const createComplex = async (
  ownerId: string,
  data: CreateComplexData
) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });
  if (!owner) {
    throw new ForbiddenError("Owner not found");
  }

  //check trùng tên complex
  const existingComplex = await prisma.complex.findFirst({
    where: {
      owner_id: ownerId,
      complex_name: {
        equals: data.complex_name,
        mode: "insensitive",
      },
    },
  });
  if (existingComplex) {
    throw new BadRequestError(
      `Complex with name '${data.complex_name}' already exists`
    );
  }

  //upload image, verification_docs
  const { complex_image, verification_docs } = await uploadComplexImages(
    data.files,
    ownerId
  );

  //check giấy tờ xác thực
  if (verification_docs.length < 1) {
    throw new BadRequestError("At least one verification document is required");
  }

  //tạo PENDING complex
  const newComplex = await prisma.complex.create({
    data: {
      owner_id: ownerId,
      complex_name: data.complex_name,
      complex_address: data.complex_address,
      complex_image: complex_image,
      verification_docs: verification_docs,
      status: "PENDING",
    },
    select: {
      id: true,
      complex_name: true,
      complex_image: true,
      complex_address: true,
      status: true,
      _count: {
        select: {
          sub_fields: true,
        },
      },
    },
  });

  return newComplex;
};

//get owner's complexes
export const getOwnerComplexes = async (
  ownerId: string,
  {
    page = 1,
    limit = 6,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });
  if (!owner) {
    throw new ForbiddenError("Owner not found");
  }

  const skip = (page - 1) * limit;

  const whereCondition: any = {
    owner_id: ownerId,
    ...(search && {
      complex_name: {
        contains: search,
        mode: "insensitive", // khong phân biệt hoa thường
      },
    }),
  };

  const [total, complexes] = await prisma.$transaction([
    prisma.complex.count({ where: whereCondition }),
    prisma.complex.findMany({
      where: whereCondition,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        complex_name: true,
        complex_address: true,
        complex_image: true,
        status: true,
        _count: {
          select: {
            sub_fields: true,
          },
        },
      },
    }),
  ]);

  return {
    complexes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOwnerComplexById = async (
  ownerId: string,
  complexId: string,
  {
    page = 1,
    limit = 6,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  //check complex thuộc owner
  const complex = await prisma.complex.findFirst({
    where: { id: complexId, owner_id: ownerId },
    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      status: true,
      _count: {
        select: {
          sub_fields: true,
        },
      },
    },
  });

  if (!complex) {
    throw new NotFoundError("Complex not found");
  }

  const skip = (page - 1) * limit;

  const whereCondition: any = {
    complex_id: complexId,
    isDelete: false,
    ...(search && {
      sub_field_name: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const [total, subFields] = await prisma.$transaction([
    prisma.subField.count({ where: whereCondition }),
    prisma.subField.findMany({
      where: whereCondition,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        sub_field_name: true,
        sport_type: true,
        sub_field_image: true,
        capacity: true,
        pricing_rules: {
          select: { base_price: true },
          orderBy: { base_price: "asc" },
          take: 1,
        },
      },
    }),
  ]);

  const formatComplex = {
    ...complex,
    sub_fields: subFields.map((sf) => ({
      id: sf.id,
      sub_field_name: sf.sub_field_name,
      sport_type: sf.sport_type,
      sub_field_image: sf.sub_field_image,
      capacity: sf.capacity,
      min_price: sf.pricing_rules[0]?.base_price || 0,
      pricing_rules: [],
    })),
  };
  return {
    complex: formatComplex,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//update complex
export const updateComplex = async (
  complexId: string,
  ownerId: string,
  data: UpdateComplexInput
) => {
  const complex = await prisma.complex.findFirst({
    where: {
      id: complexId,
      owner_id: ownerId,
    },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found or access denied");
  }

  if (complex.status === "REJECTED" || complex.status === "INACTIVE") {
    throw new ForbiddenError(
      `Cannot update complex with status '${complex.status}'`
    );
  }
  return await prisma.complex.update({
    where: { id: complexId },
    data,
  });
};

//delete complex
export const deleteComplex = async (complexId: string, ownerId: string) => {
  console.log("Deleting complex:", complexId, "for owner:", ownerId);
  const complex = await prisma.complex.findFirst({
    where: {
      id: complexId,
      owner_id: ownerId,
    },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }

  await prisma.complex.update({
    where: { id: complexId },
    data: { status: "INACTIVE" },
  });

  await prisma.subField.updateMany({
    where: { complex_id: complexId },
    data: {
      isDelete: true,
    },
  });

  return { message: "Complex and its subfields have been deactivated" };
};

/**
 * ADMIN SERVICES
 */

//get pending complexes
export const getPendingComplexes = async () => {
  const complexes = await prisma.complex.findMany({
    where: { status: "PENDING" },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      verification_docs: true,
      created_at: true,
      owner: {
        select: {
          id: true,
          account: {
            select: {
              email: true,
              full_name: true,
              phone_number: true,
            },
          },
        },
      },
    },
  });

  return complexes;
};

//approve complex
export const approveComplex = async (complexId: string) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complexId },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }
  if (complex.status !== "PENDING") {
    throw new BadRequestError("Only PENDING complexes can be approved");
  }

  const updatedComplex = await prisma.complex.update({
    where: { id: complexId },
    data: { status: "ACTIVE" },
  });

  return updatedComplex;
};

//reject complex
export const rejectComplex = async (complexId: string) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complexId },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }
  if (complex.status !== "PENDING") {
    throw new BadRequestError("Only PENDING complexes can be rejected");
  }

  const updatedComplex = await prisma.complex.update({
    where: { id: complexId },
    data: { status: "REJECTED" },
  });
  return updatedComplex;
};

//suspend complex
export const suspendComplex = async (complexId: string) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complexId },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }
  if (complex.status !== "ACTIVE") {
    throw new BadRequestError("Only ACTIVE complexes can be suspended");
  }

  const updatedComplex = await prisma.complex.update({
    where: { id: complexId },
    data: { status: "INACTIVE" },
  });

  return updatedComplex;
};

//get all complexes
export const getAllComplexesAdmin = async () => {
  const complexes = await prisma.complex.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      status: true,
      owner: {
        select: {
          id: true,
          account: {
            select: {
              email: true,
              full_name: true,
              phone_number: true,
            },
          },
        },
      },
    },
  });

  return complexes;
};
/**
 * Player SERVICES
 */

/**
 * PUBLIC SERVICES
 */
export const getComplexActive = async () => {
  const complexes = await prisma.complex.findMany({
    where: { status: "ACTIVE" },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      status: true,
      owner: {
        select: {
          id: true,
          account: {
            select: {
              email: true,
              full_name: true,
              phone_number: true,
            },
          },
        },
      },
    },
  });

  return complexes;
};
