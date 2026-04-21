import React, { useEffect, useState } from "react";
import API from "../api/axios";
import useAuthToken from "../hooks/useAuthToken";
import { Bell, BellOff, AlertCircle, Loader2 } from "lucide-react";

export default function NotificationPanel() {
  // Setup Axios interceptor with the Clerk authentication token
  useAuthToken();

  // State management for notifications, loading status, and errors
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch notifications from the Spring Boot backend
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/notifications");
        setNotifications(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Unable to load notifications. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 1. Loading State: Displays a modern spinning loader while fetching data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  // 2. Error State: Displays a clear error message with an alert icon
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
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      
      {/* 3. Empty State: Beautifully handled empty state when there are no notifications */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
            <BellOff className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700">All caught up!</h4>
          <p className="text-xs text-gray-500 mt-1">No new notifications at the moment.</p>
        </div>
      ) : (
        /* 4. Notification List: Rendered with hover effects, icons, and formatted timestamps */
        notifications.map((n) => (
          <div 
            key={n.id} 
            className="group flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
          >
            {/* Notification Icon Box */}
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
              <Bell className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            
            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-snug group-hover:text-blue-700 transition-colors duration-200">
                {n.message}
              </p>
              
              {/* Optional: Render formatted date if 'createdAt' is provided by the backend */}
              {n.createdAt && (
                <p className="text-xs font-medium text-gray-400 mt-1.5">
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        ))
      )}
      
    </div>
  );
}