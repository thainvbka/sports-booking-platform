import { uploadImage, uploadImages } from "../libs/cloudinary";
import { BadRequestError } from "../utils/error.response";

interface UploadComplexImagesResult {
  complex_image?: string;
  verification_docs: string[];
}

// Upload ảnh đại diện và giấy tờ của Complex
export const uploadComplexImages = async (
  files: { [fieldname: string]: Express.Multer.File[] },
  ownerId: string
): Promise<UploadComplexImagesResult> => {
  let complex_image: string | undefined;
  let verification_docs: string[] = [];

  // 1. Upload ảnh đại diện (optional)
  if (files.complex_image && files.complex_image[0]) {
    complex_image = await uploadImage(
      files.complex_image[0].buffer,
      `complexes/${ownerId}/images`
    );
  }

  // 2. Upload ảnh giấy tờ (required)
  if (!files.verification_docs || files.verification_docs.length === 0) {
    throw new BadRequestError(
      "At least one verification document image is required"
    );
  }

  const verificationDocsBuffers = files.verification_docs.map(
    (file) => file.buffer
  );
  verification_docs = await uploadImages(
    verificationDocsBuffers,
    `complexes/${ownerId}/docs`
  );

  return {
    complex_image,
    verification_docs,
  };
};
