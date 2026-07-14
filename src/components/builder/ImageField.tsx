"use client";

import { useState } from "react";
import { Image as ImageIcon, Link, Upload, X } from "lucide-react";
import MediaLibrary from "./MediaLibrary";

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  mediaLibrary?: string[];
  onUploadImage?: (file: File) => Promise<string>;
  label?: string;
}

export default function ImageField({
  value,
  onChange,
  mediaLibrary = [],
  onUploadImage,
  label = "Image",
}: ImageFieldProps) {
  const [mode, setMode] = useState<"url" | "upload" | "library">("url");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    setUploading(true);
    try {
      const imageUrl = await onUploadImage(file);
      onChange(imageUrl);
      setMode("url");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleLibrarySelect = (imageUrl: string) => {
    onChange(imageUrl);
    setLibraryOpen(false);
    setMode("url");
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-surface-700">{label}</label>
      
      {/* Thumbnail Preview */}
      {value && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-surface-200 bg-surface-50">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-surface-100 transition-colors"
          >
            <X className="h-4 w-4 text-surface-600" />
          </button>
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
            mode === "url"
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50"
          }`}
        >
          <Link className="h-3.5 w-3.5" />
          Paste Link
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
            mode === "upload"
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
            mode === "library"
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Library
        </button>
      </div>

      {/* URL Input Mode */}
      {mode === "url" && (
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full pl-10 pr-3 py-2 text-xs border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="border-2 border-dashed border-surface-200 rounded-lg p-6 text-center hover:border-brand-400 transition-colors">
          <Upload className="h-8 w-8 text-surface-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-surface-900 mb-1">
            Upload an image
          </p>
          <p className="text-[10px] text-surface-500 mb-3">
            PNG, JPG, GIF up to 10MB
          </p>
          <label className="inline-flex items-center px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer">
            {uploading ? "Uploading..." : "Choose File"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelectImage={handleLibrarySelect}
        mediaLibrary={mediaLibrary}
        onUploadImage={onUploadImage}
      />
    </div>
  );
}
