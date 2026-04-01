import { ProductStatus, SportType } from "@prisma/client";
import { z } from "zod";

const baseProductBody = z.object({
  complex_id: z.string().uuid("Complex ID không hợp lệ"),
  name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc").max(200),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().positive("Giá sản phẩm phải lớn hơn 0"),
  stock: z.coerce
    .number()
    .int("Số lượng tồn kho phải là số nguyên")
    .min(0, "Tồn kho không được âm"),
  sport_type: z.nativeEnum(SportType).nullable().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  image: z.string().trim().optional(),
});

export const createProductSchema = z.object({
  body: baseProductBody,
});

export const updateProductSchema = z
  .object({
    body: baseProductBody
      .partial()
      .refine(
        (payload) => Object.keys(payload).length > 0,
        "Cần ít nhất một trường để cập nhật",
      ),
    params: z.object({
      id: z.string().uuid("Product ID không hợp lệ"),
    }),
  })
  .refine((data) => !data.body.complex_id, {
    message: "Không được thay đổi complex_id của sản phẩm",
    path: ["body", "complex_id"],
  });

export const ownerGetProductsQuerySchema = z.object({
  query: z
    .object({
      complex_id: z.string().uuid().optional(),
      status: z.nativeEnum(ProductStatus).optional(),
      sport_type: z.nativeEnum(SportType).optional(),
      search: z.string().trim().optional(),
      min_price: z.coerce.number().positive().optional(),
      max_price: z.coerce.number().positive().optional(),
      min_stock: z.coerce.number().int().min(0).optional(),
      max_stock: z.coerce.number().int().min(0).optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
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
    ),
});

export const updateProductStockSchema = z.object({
  body: z.object({
    increment: z.coerce
      .number()
      .int("Số lượng nhập thêm phải là số nguyên")
      .positive("Số lượng nhập thêm phải lớn hơn 0"),
  }),
  params: z.object({
    id: z.string().uuid("Product ID không hợp lệ"),
  }),
});

export const getSubfieldProductsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Subfield ID không hợp lệ"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type OwnerGetProductsQuery = z.infer<
  typeof ownerGetProductsQuerySchema
>["query"];
export type UpdateProductStockInput = z.infer<
  typeof updateProductStockSchema
>["body"];
