import { useState } from "react";
import { Upload } from "lucide-react";
import { uploadImages } from "../services/ticketService";

export default function UploadImages({ ticketId, onUploadSuccess, showToast }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      await uploadImages(ticketId, formData);
      showToast?.("Images uploaded successfully", "success");
      onUploadSuccess?.();
      e.target.value = "";
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || "Upload failed. Max 3 images allowed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer inline-flex items-center gap-3 bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 px-8 py-4 rounded-2xl transition-all hover:shadow">
      <Upload size={22} className="text-blue-600" />
      <div>
        <span className="font-semibold text-gray-900 block">
          {uploading ? "Uploading..." : "Upload Evidence Images"}
        </span>
        <span className="text-xs text-gray-500">Max 3 images • JPG, PNG</span>
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}