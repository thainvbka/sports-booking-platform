import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import {
  createComplex,
  updateComplex,
  getOwnerComplexes,
  getPendingComplexes,
  deleteComplex,
  reactivateComplex,
  approveComplex,
  rejectComplex,
  suspendComplex,
  getAllComplexesAdmin,
  getOwnerComplexById,
} from "../../services/v1/complex.service";
import { BadRequestError } from "../../utils/error.response";

//owner controllers

export const createComplexController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const { complex_name, complex_address } = req.body;

  //req.files : { complex_image: [file], verification_docs: [file, file, ...]
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || Object.keys(files).length === 0) {
    throw new BadRequestError("No files uploaded");
  }

  // Check specifically for complex_image
  if (!files.complex_image || files.complex_image.length === 0) {
    throw new BadRequestError("Complex image is required");
  }

  // Check specifically for verification_docs
  if (!files.verification_docs || files.verification_docs.length === 0) {
    throw new BadRequestError("At least one verification document is required");
  }

  // Tạo Complex
  const newComplex = await createComplex(ownerId, {
    complex_name: complex_name,
    complex_address: complex_address,
    files,
  });

  return new SuccessResponse({
    message: "Complex created successfully and pending approval",
    data: { complex: newComplex },
  }).send(res);
};

export const getOwnerComplexesController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const search = (req.query.search as string) || "";

  const result = await getOwnerComplexes(ownerId, { page, limit, search });

  return new SuccessResponse({
    message: "Owner complexes retrieved successfully",
    data: result,
  }).send(res);
};

export const getOwnerComplexByIdController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const complexId = req.params.id;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
  const search = (req.query.search as string) || "";

  const result = await getOwnerComplexById(ownerId, complexId, {
    page,
    limit,
    search,
  });

  return new SuccessResponse({
    message: "Owner complex retrieved successfully",
    data: result,
  }).send(res);
};

export const updateComplexController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const complexId = req.params.id;

  const updatedComplex = await updateComplex(ownerId, complexId, req.body);

  return new SuccessResponse({
    message: "Complex updated successfully",
    data: { complex: updatedComplex },
  }).send(res);
};

export const deleteComplexController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const complexId = req.params.id;

  await deleteComplex(complexId, ownerId);

  return new SuccessResponse({
    message: "Complex deleted successfully",
    data: {},
  }).send(res);
};

export const reactivateComplexController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const complexId = req.params.id;

  await reactivateComplex(complexId, ownerId);

  return new SuccessResponse({
    message: "Complex reactivated successfully",
    data: {},
  }).send(res);
};

//admin controllers
export const getPendingComplexesController = async (
  req: Request,
  res: Response
) => {
  const pendingComplexes = await getPendingComplexes();

  return new SuccessResponse({
    message: "Pending complexes retrieved successfully",
    data: { complexes: pendingComplexes },
  }).send(res);
};

export const approveComplexController = async (req: Request, res: Response) => {
  const complexId = req.params.id;

  const approvedComplex = await approveComplex(complexId);

  return new SuccessResponse({
    message: "Complex approved successfully",
    data: { complex: approvedComplex },
  }).send(res);
};

export const rejectComplexController = async (req: Request, res: Response) => {
  const complexId = req.params.id;

  const rejectedComplex = await rejectComplex(complexId);

  return new SuccessResponse({
    message: "Complex rejected successfully",
    data: { complex: rejectedComplex },
  }).send(res);
};

export const suspendComplexController = async (req: Request, res: Response) => {
  const complexId = req.params.id;

  const suspendedComplex = await suspendComplex(complexId);

  return new SuccessResponse({
    message: "Complex suspended successfully",
    data: { complex: suspendedComplex },
  }).send(res);
};

export const getAllComplexesAdminController = async (
  req: Request,
  res: Response
) => {
  const complexes = await getAllComplexesAdmin();

  return new SuccessResponse({
    message: "All complexes retrieved successfully",
    data: { complexes },
  }).send(res);
};
