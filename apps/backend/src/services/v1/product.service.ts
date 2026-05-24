import { ProductStatus, SportType } from "@prisma/client";
import { uploadProductImage } from "../../helpers";
import { prisma } from "../../libs/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error.response";
import {
  CreateProductInput,
  OwnerGetProductsQuery,
  UpdateProductInput,
  UpdateProductStockInput,
} from "../../validations";

type MulterFiles = {
  [fieldname: string]: Express.Multer.File[];
};

const ensureOwnerActive = async (owner_id: string) => {
  const owner = await prisma.owner.findUnique({
    where: { id: owner_id, status: "ACTIVE" },
    select: { id: true },
  });

  if (!owner) {
    throw new ForbiddenError("Owner not found or inactive");
  }
};

const ensureComplexOwnership = async (owner_id: string, complex_id: string) => {
  const complex = await prisma.complex.findUnique({
    where: { id: complex_id },
    select: { owner_id: true, status: true },
  });

  if (!complex) {
    throw new NotFoundError("Complex not found");
  }

  if (complex.owner_id !== owner_id) {
    throw new ForbiddenError(
      "You do not have permission to manage this complex",
    );
  }

  if (complex.status !== "ACTIVE") {
    throw new BadRequestError("Complex must be ACTIVE to manage products");
  }
};

export const getProductsBySubfield = async (subfield_id: string) => {
  const subfield = await prisma.subField.findFirst({
    where: {
      id: subfield_id,
      isDelete: false,
      complex: { status: "ACTIVE" },
    },
    select: {
      complex_id: true,
      sport_type: true,
    },
  });

  if (!subfield) {
    throw new NotFoundError("Subfield not found");
  }

  const products = await prisma.product.findMany({
    where: {
      complex_id: subfield.complex_id,
      status: "ACTIVE",
      stock: { gt: 0 },
      OR: [{ sport_type: null }, { sport_type: subfield.sport_type }],
    },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      image: true,
      sport_type: true,
      status: true,
      type: true,
      created_at: true,
      updated_at: true,
    },
  });

  return { products };
};

export const ownerGetProducts = async (
  owner_id: string,
  query: OwnerGetProductsQuery,
) => {
  await ensureOwnerActive(owner_id);

  if (query.complex_id) {
    await ensureComplexOwnership(owner_id, query.complex_id);
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const search = query.search?.trim();

  const where: any = {
    ...(query.complex_id ? { complex_id: query.complex_id } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.sport_type ? { sport_type: query.sport_type } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.min_price !== undefined || query.max_price !== undefined
      ? {
          price: {
            ...(query.min_price !== undefined ? { gte: query.min_price } : {}),
            ...(query.max_price !== undefined ? { lte: query.max_price } : {}),
          },
        }
      : {}),
    ...(query.min_stock !== undefined || query.max_stock !== undefined
      ? {
          stock: {
            ...(query.min_stock !== undefined ? { gte: query.min_stock } : {}),
            ...(query.max_stock !== undefined ? { lte: query.max_stock } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              complex: {
                complex_name: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
    complex: { owner_id },
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ updated_at: "desc" }],
      select: {
        id: true,
        complex_id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        image: true,
        sport_type: true,
        status: true,
        type: true,
        created_at: true,
        updated_at: true,
        complex: {
          select: {
            complex_name: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const ownerCreateProduct = async (
  owner_id: string,
  data: CreateProductInput,
  files?: MulterFiles,
) => {
  await ensureOwnerActive(owner_id);
  await ensureComplexOwnership(owner_id, data.complex_id);

  const { product_image } = files
    ? await uploadProductImage(files, data.complex_id)
    : { product_image: undefined };

  const created = await prisma.product.create({
    data: {
      complex_id: data.complex_id,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      sport_type: data.sport_type as SportType | null | undefined,
      status: data.status ?? ProductStatus.ACTIVE,
      type: data.type,
      image: product_image ?? data.image,
    },
  });

  return created;
};

export const ownerUpdateProduct = async (
  owner_id: string,
  product_id: string,
  data: UpdateProductInput,
  files?: MulterFiles,
) => {
  await ensureOwnerActive(owner_id);

  const existing = await prisma.product.findUnique({
    where: { id: product_id },
    select: {
      id: true,
      complex_id: true,
      complex: {
        select: {
          owner_id: true,
          status: true,
        },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError("Product not found");
  }

  if (existing.complex.owner_id !== owner_id) {
    throw new ForbiddenError(
      "You do not have permission to manage this product",
    );
  }

  if (existing.complex.status !== "ACTIVE") {
    throw new BadRequestError("Cannot update product under inactive complex");
  }

  const { product_image } = files
    ? await uploadProductImage(files, existing.complex_id)
    : { product_image: undefined };

  const nextImage = product_image ?? data.image;

  return prisma.product.update({
    where: { id: product_id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.stock !== undefined ? { stock: data.stock } : {}),
      ...(data.sport_type !== undefined
        ? { sport_type: data.sport_type as SportType | null }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(nextImage !== undefined ? { image: nextImage } : {}),
    },
  });
};

export const ownerIncrementProductStock = async (
  owner_id: string,
  product_id: string,
  data: UpdateProductStockInput,
) => {
  await ensureOwnerActive(owner_id);

  const existing = await prisma.product.findUnique({
    where: { id: product_id },
    select: {
      id: true,
      complex: {
        select: {
          owner_id: true,
        },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError("Product not found");
  }

  if (existing.complex.owner_id !== owner_id) {
    throw new ForbiddenError(
      "You do not have permission to manage this product",
    );
  }

  return prisma.product.update({
    where: { id: product_id },
    data: {
      stock: {
        increment: data.increment,
      },
    },
  });
};
