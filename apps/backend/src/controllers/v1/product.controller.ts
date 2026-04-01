import { Request, Response } from "express";
import {
  getProductsBySubfield,
  ownerCreateProduct,
  ownerGetProducts,
  ownerIncrementProductStock,
  ownerUpdateProduct,
} from "../../services/v1/product.service";
import { SuccessResponse } from "../../utils/success.response";
import type { OwnerGetProductsQuery } from "../../validations";

export const getProductsBySubfieldController = async (
  req: Request,
  res: Response,
) => {
  const subfieldId = req.params.id as string;
  const result = await getProductsBySubfield(subfieldId);

  return new SuccessResponse({
    message: "Subfield products retrieved successfully",
    data: result,
  }).send(res);
};

export const ownerGetProductsController = async (
  req: Request,
  res: Response,
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const result = await ownerGetProducts(
    owner_id,
    req.query as unknown as OwnerGetProductsQuery,
  );

  return new SuccessResponse({
    message: "Owner products retrieved successfully",
    data: result,
  }).send(res);
};

export const ownerCreateProductController = async (
  req: Request,
  res: Response,
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const product = await ownerCreateProduct(owner_id, req.body);

  return new SuccessResponse({
    message: "Product created successfully",
    data: { product },
  }).send(res);
};

export const ownerUpdateProductController = async (
  req: Request,
  res: Response,
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const product_id = req.params.id as string;

  const product = await ownerUpdateProduct(owner_id, product_id, req.body);

  return new SuccessResponse({
    message: "Product updated successfully",
    data: { product },
  }).send(res);
};

export const ownerUpdateProductStockController = async (
  req: Request,
  res: Response,
) => {
  const owner_id = req.user?.profiles.ownerId as string;
  const product_id = req.params.id as string;

  const product = await ownerIncrementProductStock(
    owner_id,
    product_id,
    req.body,
  );

  return new SuccessResponse({
    message: "Product stock updated successfully",
    data: { product },
  }).send(res);
};
