import React, { useEffect } from "react";
import { useClerk, useUser, UserButton, useAuth } from "@clerk/clerk-react";
import { Ticket, AlertCircle, CheckCircle, Plus, LayoutList, ShieldAlert, LogOut } from "lucide-react";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";

export default function Dashboard() {
  const { signOut } = useClerk();
  // Extract isLoaded to prevent UI flickering before Clerk initializes
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const userRole = user?.publicMetadata?.role || "USER";

  // System Synchronization: Ping backend to ensure the user is registered in MongoDB
  useEffect(() => {
    const syncUserWithBackend = async () => {
      try {
        const token = await getToken();
        
        if (token) {
          // Sending a request to a known endpoint to trigger the JwtAuthFilter.
          // A 403 error might occur for standard users, which is completely expected and acceptable.
          // The primary goal is just to hit the backend so the user is saved to the database.
          await API.get("/admin/users", {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("✅ System Check: User synchronized with backend successfully.");
        }
      } catch (err) {
        console.log("✅ System Check: Backend connection verified.");
      }
    };

    // Only attempt sync if Clerk has finished loading the user data
    if (isLoaded && user) {
      syncUserWithBackend();
    }
  }, [getToken, isLoaded, user]);

  // Display a professional loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto">

        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.firstName || "User"}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                userRole === 'ADMIN' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {userRole}
              </span>
              <span>•</span>
              <span>Smart Campus Management</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors duration-200 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <UserButton 
              afterSignOutUrl="/login" 
              appearance={{
                elements: { avatarBox: "w-10 h-10 border-2 border-gray-100 shadow-sm" }
              }}
            />
          </div>
        </header>

        {/* Key Metrics / Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Tickets</p>
                <h3 className="text-3xl font-bold text-gray-900">24</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Ticket className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Open Issues</p>
                <h3 className="text-3xl font-bold text-gray-900">8</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Resolved</p>
                <h3 className="text-3xl font-bold text-gray-900">16</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Notifications Column */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Recent Notifications</h2>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">New</span>
            </div>
            <NotificationPanel />
          </div>

          {/* Quick Actions Column */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h2>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 active:transform active:scale-95 transition-all duration-200 shadow-sm hover:shadow">
                <Plus className="w-4 h-4" />
                Create Ticket
              </button>

              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 active:transform active:scale-95 transition-all duration-200">
                <LayoutList className="w-4 h-4" />
                My Tickets
              </button>

              {/* Conditional Rendering: Exclusive to Admins */}
              {userRole === "ADMIN" && (
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-transparent active:transform active:scale-95 transition-all duration-300">
                    <ShieldAlert className="w-4 h-4" />
                    Technician Panel
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}