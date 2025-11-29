import { uploadImage, uploadImages } from "../libs/cloudinary";

interface UploadComplexImagesResult {
  complex_image: string;
  verification_docs: string[];
}

interface UploadSubfieldImageResult {
  subfield_image: string;
}

// Upload ảnh đại diện và giấy tờ của Complex
export const uploadComplexImages = async (
  files: { [fieldname: string]: Express.Multer.File[] },
  ownerId: string
): Promise<UploadComplexImagesResult> => {
  let complex_image: string = "";
  let verification_docs: string[] = [];

  // 1. Upload ảnh đại diện
  if (files.complex_image && files.complex_image[0]) {
    complex_image = await uploadImage(
      files.complex_image[0].buffer,
      `complexes/${ownerId}/images`
    );
  }
  // 2. Upload giấy tờ xác minh
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

export const uploadSubfieldImage = async (
  files: {
    [fieldname: string]: Express.Multer.File[];
  },
  complex_id: string
): Promise<UploadSubfieldImageResult> => {
  let subfield_image: string = "";

  // Upload ảnh sân con
  if (files.subfield_image && files.subfield_image[0]) {
    subfield_image = await uploadImage(
      files.subfield_image[0].buffer,
      `complexes/${complex_id}/subfields`
    );
  }

  return {
    subfield_image,
  };
};
