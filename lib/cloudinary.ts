import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    resource_type: "image" | "raw" = "image"
): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type,
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (result) {
                    return resolve(result);
                } else {
                    return reject(new Error("Upload result is undefined."));
                }
            }
        );
        uploadStream.end(buffer);
    });
}

export default cloudinary;
