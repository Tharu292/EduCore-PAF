import { useState } from "react";
import { Upload, Image } from "lucide-react";
import { uploadImages } from "../services/ticketService";

export default function UploadImages({ ticketId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("user", "user1"); // Change dynamically later

    try {
      await uploadImages(ticketId, formData);
      alert("Images uploaded successfully!");
      onUploadSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-dashed border-gray-400 hover:border-blue-500 px-6 py-3 rounded-2xl transition">
      <Upload size={20} />
      <span className="font-medium">{uploading ? "Uploading..." : "Upload Images (max 3)"}</span>
      <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
    </label>
  );
}