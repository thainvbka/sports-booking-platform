import { uploadImage, uploadImages } from "../libs/cloudinary";

interface UploadComplexImagesResult {
  complex_image: string;
  verification_docs: string[];
}

interface UploadSubfieldImageResult {
  subfield_image: string;
}

interface UploadProductImageResult {
  product_image?: string;
}

type MulterFiles = {
  [fieldname: string]: Express.Multer.File[];
};

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

export const uploadProductImage = async (
  files: MulterFiles,
  complex_id: string
): Promise<UploadProductImageResult> => {
  let product_image: string | undefined;

  if (files.product_image && files.product_image[0]) {
    product_image = await uploadImage(
      files.product_image[0].buffer,
      `complexes/${complex_id}/products`
    );
  }

  return {
    product_image,
  };
};

export const uploadReviewImages = async (
  files: MulterFiles,
  subfield_id: string
): Promise<string[]> => {
  if (!files.images || files.images.length === 0) {
    return [];
  }

  const imageBuffers = files.images.map((file) => file.buffer);
  return uploadImages(imageBuffers, `subfields/${subfield_id}/reviews`);
};

interface UploadAccountAvatarResult {
  avatar?: string;
}

export const uploadAccountAvatar = async (
  files: MulterFiles,
  accountId: string
): Promise<UploadAccountAvatarResult> => {
  let avatar: string | undefined;

  if (files.avatar && files.avatar[0]) {
    avatar = await uploadImage(
      files.avatar[0].buffer,
      `accounts/${accountId}/avatar`
    );
  }

  return {
    avatar,
  };
};
