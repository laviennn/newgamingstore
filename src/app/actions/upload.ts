"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // Clean original filename (replace spaces, etc)
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const fileName = `${uniqueSuffix}-${originalName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    // Return the public URL
    // Ensure R2_PUBLIC_URL does not have a trailing slash in env
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return { url: publicUrl };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { error: (error as Error).message || "Failed to upload file." };
  }
}
