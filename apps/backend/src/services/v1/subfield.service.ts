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
import { updateComplexCache } from "../../helpers/complexCache";

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
  // Check if active subfield with same name exists (deleted ones are OK due to unique constraint including isDelete)
  const subfieldExists = await prisma.subField.findFirst({
    where: {
      complex_id: complexId,
      sub_field_name: {
        equals: data.subfield_name,
        mode: "insensitive",
      },
      isDelete: false,
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

  // Update complex cache after creating subfield
  await updateComplexCache(complexId);

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
      isDelete: false,
    },
    select: {
      complex: {
        select: { owner_id: true, status: true },
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
  if (subfield.complex.status !== "ACTIVE") {
    throw new ForbiddenError("Cannot access subfield of inactive complex");
  }

  const subfieldDetails = await prisma.subField.findUnique({
    where: { id: subfieldId, isDelete: false },
    select: {
      id: true,
      complex_id: true,
      sub_field_name: true,
      sport_type: true,
      sub_field_image: true,
      capacity: true,
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
    where: { id: subfieldId, isDelete: false },
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

  // Check if active subfield with same name exists (deleted ones are OK)
  const duplicateSubfield = await prisma.subField.findFirst({
    where: {
      complex_id: subfield.complex_id,
      sub_field_name: {
        equals: data.subfield_name,
        mode: "insensitive",
      },
      id: { not: subfieldId },
      isDelete: false,
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

  // Update complex cache after updating subfield (especially if sport_type changed)
  await updateComplexCache(subfield.complex_id);

  return updatedSubfield;
};

export const deleteSubfield = async (ownerId: string, subfieldId: string) => {
  //check subfield thuộc owner
  const subfield = await prisma.subField.findUnique({
    where: { id: subfieldId, isDelete: false },
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

  await prisma.subField.update({
    where: { id: subfieldId },
    data: { isDelete: true },
  });

  // Update complex cache after deleting subfield
  await updateComplexCache(subfield.complex_id);
};

/**
 Public service
 */
export const getAllPublicSubfields = async ({
  page = 1,
  limit = 6,
  search = "",
  sport_types,
  minCapacity,
  maxCapacity,
  minPrice,
  maxPrice,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sport_types?: string[];
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
}) => {
  const skip = (page - 1) * limit;

  // Build capacity filter
  let capacityFilter: any = {};
  if (minCapacity !== undefined && maxCapacity !== undefined) {
    capacityFilter = { capacity: { gte: minCapacity, lte: maxCapacity } };
  } else if (minCapacity !== undefined) {
    capacityFilter = { capacity: { gte: minCapacity } };
  } else if (maxCapacity !== undefined) {
    capacityFilter = { capacity: { lte: maxCapacity } };
  }

  // Build price filter (filter on pricing_rules)
  let priceFilter: any = {};
  if (minPrice !== undefined && maxPrice !== undefined) {
    priceFilter = {
      pricing_rules: {
        some: {
          base_price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      },
    };
  } else if (minPrice !== undefined) {
    priceFilter = {
      pricing_rules: {
        some: {
          base_price: {
            gte: minPrice,
          },
        },
      },
    };
  } else if (maxPrice !== undefined) {
    priceFilter = {
      pricing_rules: {
        some: {
          base_price: {
            lte: maxPrice,
          },
        },
      },
    };
  }

  const whereCondition: any = {
    isDelete: false,
    ...(search && {
      OR: [
        {
          sub_field_name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          complex: {
            complex_name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
        {
          complex: {
            complex_address: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
    ...(sport_types &&
      sport_types.length > 0 && {
        sport_type: {
          in: sport_types,
        },
      }),
    ...capacityFilter,
    ...priceFilter,
    complex: {
      status: "ACTIVE" as const,
    },
  };

  const [total, subfields] = await prisma.$transaction([
    prisma.subField.count({ where: whereCondition }),
    prisma.subField.findMany({
      where: whereCondition,
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
        complex: {
          select: {
            complex_name: true,
            complex_address: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedSubfields = subfields.map((sf) => ({
    id: sf.id,
    sub_field_name: sf.sub_field_name,
    sport_type: sf.sport_type,
    sub_field_image: sf.sub_field_image,
    capacity: sf.capacity,
    min_price: sf.pricing_rules[0]?.base_price || 0,
    pricing_rules: [],
    complex_name: sf.complex.complex_name,
    complex_address: sf.complex.complex_address,
  }));

  return {
    subfields: formattedSubfields,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getPublicSubfieldById = async (subfieldId: string) => {
  const subfield = await prisma.subField.findUnique({
    where: {
      id: subfieldId,
      isDelete: false,
      complex: { status: "ACTIVE" },
    },
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
      complex: {
        select: {
          id: true,
          complex_name: true,
          complex_address: true,
        },
      },
    },
  });

  if (!subfield) {
     throw new NotFoundError("Subfield not found");
  }

  return subfield;
};
