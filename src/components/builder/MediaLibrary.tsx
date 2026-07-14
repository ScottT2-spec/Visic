"use client";

import { useState } from "react";
import { X, Upload, Image as ImageIcon, Search } from "lucide-react";

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  mediaLibrary?: string[];
  onUploadImage?: (file: File) => Promise<string>;
}

const PRESET_CATEGORIES = [
  { id: "fashion", name: "Fashion", images: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
  ]},
  { id: "beauty", name: "Beauty", images: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
  ]},
  { id: "grocery", name: "Grocery", images: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
    "https://images.unsplash.com/photo-1568702846914-96b305d2uj38?w=400",
    "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400",
  ]},
  { id: "electronics", name: "Electronics", images: [
    "https://images.unsplash.com/photo-1498049794561-7780e52023cc?w=400",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    "https://images.unsplash.com/photo-1535378437327-10f28af4cf21?w=400",
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400",
  ]},
  { id: "interior", name: "Interior", images: [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
  ]},
];

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelectImage,
  mediaLibrary = [],
  onUploadImage,
}: MediaLibraryProps) {
  const [activeCategory, setActiveCategory] = useState("fashion");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploads, setShowUploads] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    setUploading(true);
    try {
      const imageUrl = await onUploadImage(file);
      onSelectImage(imageUrl);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const currentCategory = PRESET_CATEGORIES.find((cat) => cat.id === activeCategory);
  const filteredImages = currentCategory?.images.filter((img) =>
    img.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-bold text-surface-900">Media Library</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <X className="h-5 w-5 text-surface-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-100 px-6">
          <button
            type="button"
            onClick={() => setShowUploads(false)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              !showUploads ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400 hover:text-surface-600"
            }`}
          >
            Preset Assets
          </button>
          <button
            type="button"
            onClick={() => setShowUploads(true)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              showUploads ? "text-brand-600 border-b-2 border-brand-600" : "text-surface-400 hover:text-surface-600"
            }`}
          >
            Your Uploads {mediaLibrary.length > 0 && `(${mediaLibrary.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!showUploads ? (
            <>
              {/* Category Tabs */}
              <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-surface-100">
                {PRESET_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategory === category.id
                        ? "bg-brand-600 text-white"
                        : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="px-6 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Image Grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="grid grid-cols-4 gap-4">
                  {filteredImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onSelectImage(imageUrl)}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-500 transition-colors group"
                    >
                      <img
                        src={imageUrl}
                        alt={`Preset ${index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
                {filteredImages.length === 0 && (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                    <p className="text-sm text-surface-500">No images found</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Upload Section */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-brand-400 transition-colors">
                  <Upload className="h-12 w-12 text-surface-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-surface-900 mb-2">
                    Upload an image
                  </p>
                  <p className="text-xs text-surface-500 mb-4">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors cursor-pointer">
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

                {/* Uploaded Images */}
                {mediaLibrary.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-surface-900 mb-3">Your Uploads</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {mediaLibrary.map((imageUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onSelectImage(imageUrl)}
                          className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-brand-500 transition-colors group"
                        >
                          <img
                            src={imageUrl}
                            alt={`Upload ${index}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
          <p className="text-xs text-surface-500">
            Click on an image to select it for your section
          </p>
        </div>
      </div>
    </div>
  );
}
