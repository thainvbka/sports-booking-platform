import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";
import { BadRequestError } from "../../utils/error.response";
import {
  createSubfield,
  // getOwnerSubfields,
  getOwnerSubfieldById,
  updateSubfield,
  deleteSubfield,
} from "../../services/v1/subfield.service";

/* owner controllers */

export const createSubfieldController = async (req: Request, res: Response) => {
  const complexId = req.params.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  console.log("=== CREATE SUBFIELD DEBUG ===");
  console.log("Body:", req.body);
  console.log("Files:", files);
  console.log("Owner ID:", req.user?.profiles.ownerId);
  console.log("Complex ID:", complexId);

  if (
    !files ||
    !files["subfield_image"] ||
    files["subfield_image"].length === 0
  ) {
    throw new BadRequestError("Subfield image is required");
  }

  const newSubfield = await createSubfield(
    req.user?.profiles.ownerId as string,
    complexId,
    {
      ...req.body,
      files,
    }
  );

  return new SuccessResponse({
    message: "Subfield created successfully",
    data: { subfield: newSubfield },
  }).send(res);
};

// export const getOwnerSubfieldsController = async (
//   req: Request,
//   res: Response
// ) => {
//   const ownerId = req.user?.profiles.ownerId as string;
//   const complexId = req.params.id;

//   const subfields = await getOwnerSubfields(ownerId, complexId);

//   return new SuccessResponse({
//     message: "Owner subfields retrieved successfully",
//     data: { subfields },
//   }).send(res);
// };

export const getOwnerSubfieldByIdController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const subfieldId = req.params.id;

  const subfield = await getOwnerSubfieldById(ownerId, subfieldId);

  return new SuccessResponse({
    message: "Owner subfield retrieved successfully",
    data: { subfield },
  }).send(res);
};

export const updateSubfieldController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const subfieldId = req.params.id;

  const subfield = await updateSubfield(ownerId, subfieldId, req.body);

  return new SuccessResponse({
    message: "Subfield updated successfully",
    data: { subfield },
  }).send(res);
};

export const deleteSubfieldController = async (req: Request, res: Response) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const subfieldId = req.params.id;

  await deleteSubfield(ownerId, subfieldId);

  return new SuccessResponse({
    message: "Subfield deleted successfully",
    data: {},
  }).send(res);
};
