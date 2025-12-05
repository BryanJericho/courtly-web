"use client";

import { useState } from "react";
import Image from "next/image";

interface CloudinaryUploadProps {
  onUploadSuccess: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  existingImages?: string[];
}

export default function CloudinaryUpload({
  onUploadSuccess,
  multiple = true,
  maxFiles = 5,
  existingImages = [],
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [error, setError] = useState<string>("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dsi10nubn";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "courtly_courts";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > maxFiles) {
      setError(`Maksimal ${maxFiles} gambar`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset!);
        formData.append("folder", "courtly/courts");

        console.log("Uploading to:", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        console.log("Upload preset:", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Cloudinary error:", errorData);
          throw new Error(errorData.error?.message || "Upload gagal");
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...urls];
      setUploadedImages(newImages);
      onUploadSuccess(newImages);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal upload gambar. Coba lagi.";
      setError(errorMsg);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUploadSuccess(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Gambar Lapangan {multiple && `(Max ${maxFiles})`}
        </label>

        <div className="flex items-center gap-4">
          <label
            className={`px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition ${
              uploading || uploadedImages.length >= maxFiles
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <span className="text-sm text-gray-700">
              {uploading ? "Uploading..." : "Pilih Gambar"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleUpload}
              disabled={uploading || uploadedImages.length >= maxFiles}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              <span className="text-sm text-gray-600">Mengupload...</span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <p className="text-xs text-gray-500 mt-2">
          Format: JPG, PNG, WEBP. Max size: 10MB per file
        </p>
      </div>

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Utama
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
