import React from "react";
import { BellRing, Settings2 } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import AppLayout from "../components/AppLayout";
import NotificationPanel from "../components/NotificationPanel";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function NotificationsPage() {
  const { user } = useUser();
  const { role } = useCurrentUserRole();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-3xl p-8 md:p-5 text-white shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-2xl font-semibold tracking-tight">
              Notifications Center
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Stay updated with ticket status changes, assignments, and important alerts.
            </p>
          </div>

          {/* Decorative element */}
          <div className="absolute top-6 right-8 opacity-10">
            <div className="w-32 h-32 border-8 border-white rounded-full" />
          </div>
        </div>

        {/* Notifications Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[70vh]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <BellRing className="w-6 h-6 text-[#006591]" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Your Alerts</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Review recent activity and updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                <Settings2 className="w-4 h-4" />
                Preferences
              </button>

              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: { avatarBox: "w-9 h-9 border-2 border-gray-100" }
                }}
              />
            </div>
          </div>

          <NotificationPanel />
        </div>
      </div>
    </AppLayout>
  );
}