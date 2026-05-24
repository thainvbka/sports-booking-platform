import { ProductStatus, ProductType, SportType } from "@/types";
import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().optional(),
);

const optionalPositiveNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z.coerce.number().positive("Giá phải lớn hơn 0").optional(),
);

const optionalNonNegativeInt = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z.coerce
    .number()
    .int("Tồn kho phải là số nguyên")
    .min(0, "Tồn kho không được âm")
    .optional(),
);

const createProductBodySchema = z.object({
  complex_id: z.string().uuid("Cơ sở không hợp lệ"),
  name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc").max(200),
  description: optionalTrimmedString
    .pipe(z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional())
    .optional(),
  price: z.coerce.number().positive("Giá sản phẩm phải lớn hơn 0"),
  stock: z.coerce
    .number()
    .int("Số lượng tồn kho phải là số nguyên")
    .min(0, "Tồn kho không được âm"),
  sport_type: z.nativeEnum(SportType).nullable().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  type: z.nativeEnum(ProductType).optional(),
});

export const createProductFormSchema = createProductBodySchema;

export const updateProductFormSchema = createProductBodySchema.omit({
  complex_id: true,
});

export const updateProductStockFormSchema = z.object({
  increment: z.coerce
    .number()
    .int("Số lượng nhập thêm phải là số nguyên")
    .positive("Số lượng nhập thêm phải lớn hơn 0"),
});

export const ownerProductFilterSchema = z
  .object({
    complex_id: z.string().uuid("Cơ sở không hợp lệ").optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    sport_type: z.nativeEnum(SportType).optional(),
    type: z.nativeEnum(ProductType).optional(),
    search: optionalTrimmedString,
    min_price: optionalPositiveNumber,
    max_price: optionalPositiveNumber,
    min_stock: optionalNonNegativeInt,
    max_stock: optionalNonNegativeInt,
  })
  .refine(
    (query) =>
      query.min_price === undefined ||
      query.max_price === undefined ||
      query.min_price <= query.max_price,
    {
      message: "min_price không được lớn hơn max_price",
      path: ["min_price"],
    },
  )
  .refine(
    (query) =>
      query.min_stock === undefined ||
      query.max_stock === undefined ||
      query.min_stock <= query.max_stock,
    {
      message: "min_stock không được lớn hơn max_stock",
      path: ["min_stock"],
    },
  );

export type CreateProductFormInput = z.infer<typeof createProductFormSchema>;
export type UpdateProductFormInput = z.infer<typeof updateProductFormSchema>;
export type UpdateProductStockFormInput = z.infer<
  typeof updateProductStockFormSchema
>;
export type OwnerProductFilterInput = z.infer<typeof ownerProductFilterSchema>;
