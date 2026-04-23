import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-50
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      <span className="font-medium">{message}</span>
    </div>
  );
}