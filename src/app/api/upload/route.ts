import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const hash = crypto.randomBytes(12).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

// POST /api/upload — accepts multipart form data with one or more "file" fields
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const uploaded: Array<{ url: string; name: string; size: number }> = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(
          `${file.name}: Invalid file type (${file.type}). Allowed: JPEG, PNG, WebP, GIF, SVG`
        );
        continue;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB`
        );
        continue;
      }

      const fileName = generateFileName(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        errors.push(`${file.name}: ${uploadError.message}`);
        continue;
      }

      uploaded.push({
        url: getPublicUrl(fileName),
        name: file.name,
        size: file.size,
      });
    }

    if (uploaded.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join("; ") },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        files: uploaded,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
