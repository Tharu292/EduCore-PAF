import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Ticket,
  Bell,
  ShieldCheck,
  Users,
  Menu,
  X
} from "lucide-react";
import API from "../api/axios";

export default function Sidebar() {
  const location = useLocation();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("USER");
  const [loadingRole, setLoadingRole] = useState(true);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await API.get("/users/me");
        const roles = res.data.roles || [];

        if (roles.includes("ADMIN")) {
          setUserRole("ADMIN");
        } else if (roles.includes("TECHNICIAN")) {
          setUserRole("TECHNICIAN");
        } else {
          setUserRole("USER");
        }
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setUserRole("USER");
      } finally {
        setLoadingRole(false);
      }
    };

    if (isLoaded && isSignedIn && user?.id) {
      fetchRole();
    } else if (isLoaded) {
      setLoadingRole(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return (
    <>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-2xl shadow-lg md:hidden"
      >
        {isCollapsed ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`h-screen bg-white border-r transition-all duration-300 fixed md:static z-40
        ${isCollapsed ? "w-0 md:w-20 overflow-hidden" : "w-72"}`}
      >
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            📚
          </div>
          {!isCollapsed && <h2 className="text-2xl font-bold">Smart Campus</h2>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
              isActive("/dashboard") ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard size={20} /> {!isCollapsed && "Dashboard"}
          </Link>

          <Link
            to="/my-tickets"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
              isActive("/my-tickets") ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            <Ticket size={20} /> {!isCollapsed && "My Tickets"}
          </Link>

          <Link
            to="/notifications"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
              isActive("/notifications") ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
            }`}
          >
            <Bell size={20} /> {!isCollapsed && "Notifications"}
          </Link>

          {!loadingRole && (userRole === "TECHNICIAN" || userRole === "ADMIN") && (
            <Link
              to="/technician"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                isActive("/technician") ? "bg-amber-50 text-amber-700" : "hover:bg-gray-100"
              }`}
            >
              <Users size={20} /> {!isCollapsed && "Technician Dashboard"}
            </Link>
          )}

          {!loadingRole && userRole === "ADMIN" && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                isActive("/admin") ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-100"
              }`}
            >
              <ShieldCheck size={20} /> {!isCollapsed && "Admin Dashboard"}
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}