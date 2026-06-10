import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Bell, BellOff, AlertCircle, Loader2, CheckCheck } from "lucide-react";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-800">Connection Error</h4>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {notifications.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
              <BellOff className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700">All caught up!</h4>
            <p className="text-xs text-gray-500 mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`group flex items-start gap-4 p-4 border rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
                n.read
                  ? "bg-white border-gray-100"
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                n.read ? "bg-gray-100" : "bg-blue-100"
              }`}>
                <Bell className={`w-5 h-5 ${n.read ? "text-gray-500" : "text-blue-600"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">
                  {n.message}
                </p>

                {n.createdAt && (
                  <p className="text-xs font-medium text-gray-400 mt-1.5">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}