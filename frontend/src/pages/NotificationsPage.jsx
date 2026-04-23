import React from "react";
import { BellRing, Settings2 } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import AppLayout from "../components/AppLayout";
import NotificationPanel from "../components/NotificationPanel";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function NotificationsPage() {
  const { role } = useCurrentUserRole();

  return (
    <AppLayout>
      <header className="flex items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-blue-600" />
            Notifications Center
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                role === "ADMIN"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : role === "TECHNICIAN"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {role}
            </span>
            <span>•</span>
            <span>View your recent updates and alerts</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors duration-200">
            <Settings2 className="w-4 h-4" />
            Preferences
          </button>

          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: { avatarBox: "w-10 h-10 border-2 border-gray-100 shadow-sm" }
            }}
          />
        </div>
      </header>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[70vh]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Your Alerts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review ticket status changes, comments, and assignment updates.
            </p>
          </div>
        </div>

        <NotificationPanel />
      </div>
    </AppLayout>
  );
}