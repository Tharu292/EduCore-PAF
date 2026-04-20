import React from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { BellRing, Settings2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationPanel from "../components/NotificationPanel";

export default function NotificationsPage() {
  const { user } = useUser();
  // Fallback to "USER" if the role is not explicitly set in metadata
  const userRole = user?.publicMetadata?.role || "USER";

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto">
        
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BellRing className="w-6 h-6 text-blue-600" />
              Notifications Center
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              {/* Dynamic Role Badge mirroring the Dashboard design */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                userRole === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {userRole}
              </span>
              <span>•</span>
              <span>View your recent updates and alerts</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Clerk's UserButton with slightly enhanced avatar styling */}
            <UserButton 
              afterSignOutUrl="/login" 
              appearance={{
                elements: { avatarBox: "w-10 h-10 border-2 border-gray-100 shadow-sm" }
              }}
            />
          </div>
        </header>

        {/* Notifications Container */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[70vh]">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Your Alerts</h2>
              <p className="text-sm text-gray-500 mt-1">
                Review system updates, ticket status changes, and general announcements.
              </p>
            </div>
            
            {/* Optional visual flourish: Preferences Button */}
            <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors duration-200">
              <Settings2 className="w-4 h-4" />
              Preferences
            </button>
          </div>

          {/* Core Notification Panel Component */}
          {/* Since we already upgraded NotificationPanel.jsx, it will perfectly fit inside this container */}
          <NotificationPanel />
          
        </div>
      </main>
    </div>
  );
}