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
    },
  });

  return newComplex;
};

//get owner's complexes
export const getOwnerComplexes = async (ownerId: string) => {
  //check owner
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
  });
  if (!owner) {
    throw new ForbiddenError("Owner not found");
  }

  const complexes = await prisma.complex.findMany({
    where: { owner_id: ownerId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      status: true,
    },
  });

  return complexes;
};

export const getOwnerComplexById = async (
  ownerId: string,
  complexId: string
) => {
  const complex = await prisma.complex.findFirst({
    where: { id: complexId, owner_id: ownerId },

    select: {
      id: true,
      complex_name: true,
      complex_address: true,
      complex_image: true,
      status: true,
      //select sub_fields if needed
    },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }
  return complex;
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

  await prisma.complex.delete({
    where: { id: complexId },
  });
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
