import { prisma } from "@sports-booking-platform/db";
import {
  CreateSubfieldInput,
  UpdateSubfieldInput,
} from "@sports-booking-platform/validation/subfield.schema";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import { uploadSubfieldImage } from "../../helpers/upload";

interface CreateSubfieldData extends CreateSubfieldInput {
  files: { [fieldname: string]: Express.Multer.File[] };
}

export const createSubfield = async (
  ownerId: string,
  complexId: string,
  data: CreateSubfieldData
) => {
  //check complex thuộc owner
  const complex = await prisma.complex.findUnique({
    where: { id: complexId, status: "ACTIVE" },
    select: { owner_id: true },
  });
  if (!complex) {
    throw new NotFoundError("Complex not found");
  }
  if (complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this complex"
    );
  }
  const subfieldExists = await prisma.subField.findFirst({
    where: {
      complex_id: complexId,
      sub_field_name: {
        equals: data.subfield_name,
        mode: "insensitive",
      },
    },
  });

  if (subfieldExists) {
    throw new BadRequestError(
      `Subfield with name '${data.subfield_name}' already exists in this complex`
    );
  }

  const { subfield_image } = await uploadSubfieldImage(data.files, complexId);

  const newSubfield = await prisma.subField.create({
    data: {
      complex_id: complexId,
      sub_field_name: data.subfield_name,
      sport_type: data.sport_type,
      sub_field_image: subfield_image,
      capacity: data.capacity,
    },
  });

  return newSubfield;
};

// export const getOwnerSubfields = async (ownerId: string, complexId: string) => {
//   //check complex thuộc owner
//   const complex = await prisma.complex.findUnique({
//     where: { id: complexId },
//     select: { owner_id: true },
//   });
//   if (!complex) {
//     throw new NotFoundError("Complex not found");
//   }
//   if (complex.owner_id !== ownerId) {
//     throw new ForbiddenError(
//       "You do not have permission to manage this complex"
//     );
//   }

//   const subfields = await prisma.subField.findMany({
//     where: { complex_id: complexId },
//     select: {
//       id: true,
//       sub_field_name: true,
//       sport_type: true,
//       sub_field_image: true,
//       capacity: true,
//       pricing_rules: {
//         select: { base_price: true },
//         orderBy: { base_price: "asc" },
//         take: 1,
//       },
//     },
//   });

//   return subfields.map((sf) => ({
//     id: sf.id,
//     sub_field_name: sf.sub_field_name,
//     sport_type: sf.sport_type,
//     sub_field_image: sf.sub_field_image,
//     capacity: sf.capacity,
//     min_price: sf.pricing_rules[0]?.base_price || 0,
//     pricing_rules: [],
//   }));
// };

export const getOwnerSubfieldById = async (
  ownerId: string,
  subfieldId: string
) => {
  //check subfield thuộc owner
  const subfield = await prisma.subField.findUnique({
    where: {
      id: subfieldId,
      complex: {
        status: "ACTIVE",
      },
    },
    select: {
      complex: {
        select: { owner_id: true },
      },
    },
  });
  if (!subfield) {
    throw new NotFoundError("Subfield not found");
  }
  if (subfield.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this subfield"
    );
  }

  const subfieldDetails = await prisma.subField.findUnique({
    where: { id: subfieldId },
    select: {
      id: true,
      sub_field_name: true,
      sport_type: true,
      sub_field_image: true,
      capacity: true,
      pricing_rules: {
        select: {
          id: true,
          day_of_week: true,
          start_time: true,
          end_time: true,
          base_price: true,
        },
      },
    },
  });
  return subfieldDetails;
};

export const updateSubfield = async (
  ownerId: string,
  subfieldId: string,
  data: UpdateSubfieldInput
) => {
  //check subfield thuộc owner
  const subfield = await prisma.subField.findUnique({
    where: { id: subfieldId },
    select: {
      complex: {
        select: { owner_id: true },
      },
      complex_id: true,
    },
  });
  if (!subfield) {
    throw new NotFoundError("Subfield not found");
  }
  if (subfield.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this subfield"
    );
  }

  const duplicateSubfield = await prisma.subField.findFirst({
    where: {
      complex_id: subfield.complex_id,
      sub_field_name: {
        equals: data.subfield_name,
        mode: "insensitive",
      },
      id: { not: subfieldId },
    },
  });

  if (duplicateSubfield) {
    throw new BadRequestError(
      `Subfield with name '${data.subfield_name}' already exists in this complex`
    );
  }

  const updatedSubfield = await prisma.subField.update({
    where: { id: subfieldId },
    data: {
      sub_field_name: data.subfield_name,
      sport_type: data.sport_type,
      capacity: data.capacity,
    },
  });

  return updatedSubfield;
};

export const deleteSubfield = async (ownerId: string, subfieldId: string) => {
  //check subfield thuộc owner
  const subfield = await prisma.subField.findUnique({
    where: { id: subfieldId },
    select: {
      complex: {
        select: { owner_id: true },
      },
    },
  });
  if (!subfield) {
    throw new NotFoundError("Subfield not found");
  }
  if (subfield.complex.owner_id !== ownerId) {
    throw new ForbiddenError(
      "You do not have permission to manage this subfield"
    );
  }

  await prisma.subField.update({
    where: { id: subfieldId },
    data: { isDelete: true },
  });
};
// GET	/api/v1/public/complexes/:id/sub-fields	Xem danh sách sân con
// GET	/api/v1/public/sub-fields/:id/available-slots	Xem khung giờ còn trống
export const getAllSubfield = async () => {
  const subfields = await prisma.subField.findMany();
  return subfields;
};
