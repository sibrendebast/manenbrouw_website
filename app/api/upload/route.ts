import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAdminSession } from "@/lib/session";

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 10;

export async function POST(request: Request) {
    try {
        // 1. Authenticate admin user
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Admin privileges required." },
                { status: 401 }
            );
        }

        const data = await request.formData();
        const files: File[] = data.getAll("files") as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
        }

        if (files.length > MAX_FILES_PER_REQUEST) {
            return NextResponse.json(
                { success: false, message: `Maximum ${MAX_FILES_PER_REQUEST} files per upload allowed` },
                { status: 400 }
            );
        }

        // Validate Cloudinary configuration
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { success: false, message: "Cloudinary is not configured" },
                { status: 500 }
            );
        }

        // 2. Validate all files before uploading any
        for (const file of files) {
            if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Invalid file type (${file.type}). Only JPEG, PNG, WEBP, and GIF images are allowed.`,
                    },
                    { status: 400 }
                );
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `File "${file.name}" exceeds the maximum allowed size of 5MB.`,
                    },
                    { status: 400 }
                );
            }
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Convert buffer to base64 data URI
            const base64 = buffer.toString("base64");
            const dataURI = `data:${file.type};base64,${base64}`;

            // Upload to Cloudinary with explicit image resource type
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "manenbrouw",
                resource_type: "image",
            });

            uploadedUrls.push(result.secure_url);
        }

        return NextResponse.json({ success: true, urls: uploadedUrls });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : "Upload failed",
            },
            { status: 500 }
        );
    }
}
