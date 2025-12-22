import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import {
  getPublicComplexActive,
  getPublicComplexById,
} from "../../services/v1/complex.service";
import { getAllPublicSubfields } from "../../services/v1/subfield.service";

// Helper function to parse string array from query params
const parseStringArray = (value: unknown): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return typeof value === "string" ? [value] : undefined;
};

//complex public controllers
export const getPublicComplexActiveController = async (
  req: Request,
  res: Response
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 4;
  const search = (req.query.search as string) || "";

  // Parse sport_types as array
  const sport_types = parseStringArray(req.query.sport_types);

  // Parse price filters
  const minPrice = req.query.minPrice
    ? parseInt(req.query.minPrice as string)
    : undefined;
  const maxPrice = req.query.maxPrice
    ? parseInt(req.query.maxPrice as string)
    : undefined;

  const result = await getPublicComplexActive({
    page,
    limit,
    search,
    sport_types,
    minPrice,
    maxPrice,
  });

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

  // Parse sport_types as array
  const sport_types = parseStringArray(req.query.sport_types);

  // Parse capacity filters
  const minCapacity = req.query.minCapacity
    ? parseInt(req.query.minCapacity as string)
    : undefined;
  const maxCapacity = req.query.maxCapacity
    ? parseInt(req.query.maxCapacity as string)
    : undefined;

  // Parse price filters
  const minPrice = req.query.minPrice
    ? parseInt(req.query.minPrice as string)
    : undefined;
  const maxPrice = req.query.maxPrice
    ? parseInt(req.query.maxPrice as string)
    : undefined;

  const result = await getAllPublicSubfields({
    page,
    limit,
    search,
    sport_types,
    minCapacity,
    maxCapacity,
    minPrice,
    maxPrice,
  });

  return new SuccessResponse({
    message: "Get all public subfields successfully",
    data: result,
  }).send(res);
};

//pricing rule public controllers
