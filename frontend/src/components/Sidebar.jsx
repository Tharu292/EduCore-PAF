import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { LayoutDashboard, Ticket, Bell, ShieldCheck, Settings, GraduationCap } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  // Extract user role with a fallback to "USER"
  const userRole = user?.publicMetadata?.role || "USER";

  // Helper function to check if the current route matches the link path
  const isActive = (path) => location.pathname === path;

  // Array of standard navigation items for cleaner rendering and easy maintenance
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tickets", path: "/tickets", icon: Ticket },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 hidden md:flex">
      
      {/* Brand / Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Smart Campus</h2>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
              {link.name}
            </Link>
          );
        })}

        {/* Conditional Rendering: Administration Section */}
        {userRole === "ADMIN" && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-100"></div>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive("/admin")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${isActive("/admin") ? "text-indigo-600" : "text-gray-400"}`} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Section: Settings */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            isActive("/settings")
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className={`w-5 h-5 ${isActive("/settings") ? "text-gray-700" : "text-gray-400"}`} />
          Settings
        </Link>
      </div>

    </aside>
  );
}