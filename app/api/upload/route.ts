import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    const data = await request.formData();
    const files: File[] | null = data.getAll("files") as unknown as File[];

    if (!files || files.length === 0) {
        return NextResponse.json({ success: false, message: "No files uploaded" });
    }

    const uploadedUrls: string[] = [];

    try {
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const filename = file.name.replace(/\.[^/.]+$/, "") + "-" + uniqueSuffix + path.extname(file.name);
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            uploadedUrls.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ success: true, urls: uploadedUrls });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" });
    }
}
