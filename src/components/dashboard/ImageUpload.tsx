"use client";
import { Loader2, Plus, X } from "lucide-react";
import { Camera, ImageIcon, Upload } from "@/components/icons/FilledIcons";

import { useState, useRef, useCallback } from "react";

interface UploadedImage {
  url: string;
  alt?: string;
}

interface ImageUploadProps {
  /** Current images */
  images: UploadedImage[];
  /** Called whenever images change (add/remove/reorder) */
  onChange: (images: UploadedImage[]) => void;
  /** Allow multiple images (gallery mode) */
  multiple?: boolean;
  /** Max number of images (only for multiple mode) */
  max?: number;
  /** Label shown above the upload area */
  label?: string;
  /** Show "MAIN" badge on first image */
  showMainBadge?: boolean;
  /** Compact mode — smaller preview for single image fields */
  compact?: boolean;
  /** Optional className for the container */
  className?: string;
}

async function uploadFiles(files: File[]): Promise<{ url: string; name: string }[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("file", file);
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Upload failed");
  }

  return json.data.files;
}

export default function ImageUpload({
  images,
  onChange,
  multiple = false,
  max = 20,
  label,
  showMainBadge = false,
  compact = false,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      // Limit check
      if (multiple && images.length + files.length > max) {
        setError(`Maximum ${max} images allowed`);
        return;
      }
      if (!multiple && files.length > 1) {
        // Only take the first file for single mode
        files.length = 1;
      }

      setUploading(true);
      setError("");

      try {
        const uploaded = await uploadFiles(files);
        const newImages = uploaded.map((f) => ({ url: f.url, alt: "" }));

        if (multiple) {
          onChange([...images, ...newImages]);
        } else {
          // Single mode replaces the existing image
          onChange(newImages.slice(0, 1));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-selected
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images, onChange, multiple, max]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const updateAlt = (index: number, alt: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)));
  };

  // ─── Single / Compact Mode ─────────────────────────────────

  if (!multiple && compact) {
    const currentImage = images[0];
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
        )}
        <div className="flex items-center gap-3">
          {currentImage ? (
            <div className="relative group">
              <img
                src={currentImage.url}
                alt={currentImage.alt || ""}
                className="h-16 w-16 rounded-xl object-cover border border-surface-200"
              />
              <button
                onClick={() => onChange([])}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-16 w-16 rounded-xl border-2 border-dashed border-surface-200 flex items-center justify-center bg-surface-50">
              <ImageIcon className="h-6 w-6 text-surface-300" />
            </div>
          )}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  {currentImage ? "Change" : "Upload"}
                </>
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  // ─── Single Mode (non-compact) ─────────────────────────────

  if (!multiple) {
    const currentImage = images[0];
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {currentImage ? (
          <div className="relative group inline-block">
            <img
              src={currentImage.url}
              alt={currentImage.alt || ""}
              className="max-h-48 rounded-xl object-cover border border-surface-200"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-surface-900 hover:bg-white transition-colors"
              >
                <Camera className="h-3.5 w-3.5 inline mr-1" />
                Change
              </button>
              <button
                onClick={() => onChange([])}
                className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5 inline mr-1" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-brand-400 bg-brand-50"
                : "border-surface-200 bg-surface-50 hover:border-surface-300 hover:bg-surface-100"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-600 font-medium">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-surface-400 mt-1">
                  JPEG, PNG, WebP, GIF — Max 10MB
                </p>
              </>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // ─── Multiple / Gallery Mode ───────────────────────────────

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X className="h-3 w-3" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Existing images */}
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="group relative rounded-xl border border-surface-200 overflow-hidden bg-surface-50"
          >
            <div className="aspect-square relative">
              <img
                src={img.url}
                alt={img.alt || `Image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {showMainBadge && i === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  MAIN
                </span>
              )}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="p-2">
              <input
                value={img.alt || ""}
                onChange={(e) => updateAlt(i, e.target.value)}
                className="w-full text-[10px] bg-transparent border-0 border-b border-surface-200 focus:outline-none focus:border-brand-500 text-surface-600 py-0.5"
                placeholder="Alt text (optional)"
              />
            </div>
          </div>
        ))}

        {/* Upload button card */}
        {images.length < max && (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center transition-colors ${
              dragOver
                ? "border-brand-400 bg-brand-50"
                : "border-surface-200 bg-surface-50 hover:border-surface-300 hover:bg-surface-100"
            }`}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-surface-100 flex items-center justify-center mb-2">
                  <Plus className="h-5 w-5 text-surface-400" />
                </div>
                <p className="text-xs text-surface-500 font-medium">Add Image</p>
                <p className="text-[10px] text-surface-400 mt-0.5">or drag & drop</p>
              </>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-[10px] text-surface-400 mt-2">
          {images.length}/{max} images · Drag & drop to add more
        </p>
      )}
    </div>
  );
}

// ─── Single Image Upload (convenience wrapper) ──────────────

interface SingleImageUploadProps {
  image: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function SingleImageUpload({
  image,
  onChange,
  label,
  compact = false,
  className = "",
}: SingleImageUploadProps) {
  const images = image ? [{ url: image }] : [];
  return (
    <ImageUpload
      images={images}
      onChange={(imgs) => onChange(imgs.length > 0 ? imgs[0].url : null)}
      multiple={false}
      compact={compact}
      label={label}
      className={className}
    />
  );
}
