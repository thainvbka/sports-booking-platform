import { v2 as cloudinary } from "cloudinary";
import { config } from "../configs";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

//upload 1 ảnh
export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string = "sports-booking/complexes"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

//upload nhiều ảnh
export const uploadImages = async (
  fileBuffers: Buffer[],
  folder: string = "sports-booking/complexes"
): Promise<string[]> => {
  const uploadPromises = fileBuffers.map((buffer) =>
    uploadImage(buffer, folder)
  );
  return Promise.all(uploadPromises);
};
