import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import {
  getPublicComplexActive,
  getPublicComplexById,
} from "../../services/v1/complex.service";
import { getAllPublicSubfields } from "../../services/v1/subfield.service";

//complex public controllers
export const getPublicComplexActiveController = async (
  req: Request,
  res: Response
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 4;
  const search = (req.query.search as string) || "";
  const result = await getPublicComplexActive({ page, limit, search });
  return new SuccessResponse({
    message: "Get public active complexes successfully",
    data: result,
  }).send(res);
};

export const getPublicComplexByIdController = async (
  req: Request,
  res: Response
) => {
  const complexId = req.params.id;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const search = (req.query.search as string) || "";

  const result = await getPublicComplexById(complexId, {
    page,
    limit,
    search,
  });

  return new SuccessResponse({
    message: "Get public complex by id successfully",
    data: result,
  }).send(res);
};

//subfield public controllers
export const getAllPublicSubfieldsController = async (
  req: Request,
  res: Response
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const search = (req.query.search as string) || "";

  const result = await getAllPublicSubfields({ page, limit, search });

  return new SuccessResponse({
    message: "Get all public subfields successfully",
    data: result,
  }).send(res);
};

//pricing rule public controllers
