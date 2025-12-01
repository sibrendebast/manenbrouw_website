import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const files: File[] | null = data.getAll("files") as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "No files uploaded" });
        }

        // Validate Cloudinary configuration
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json({
                success: false,
                message: "Cloudinary is not configured"
            });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Convert buffer to base64
            const base64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'manenbrouw', // Organize uploads in a folder
                resource_type: 'auto', // Automatically detect resource type
            });

            uploadedUrls.push(result.secure_url);
        }

        return NextResponse.json({ success: true, urls: uploadedUrls });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Upload failed"
        });
    }
}
