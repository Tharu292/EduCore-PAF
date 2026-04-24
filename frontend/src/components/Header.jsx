import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import {
  Bell,
  ShieldCheck,
  Wrench,
  Home,
  ClipboardList,
  Building2,
  CalendarDays,
  TicketPlus,
} from "lucide-react";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { role, loadingRole } = useCurrentUserRole();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#006591] text-white shadow-sm"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

  const homePath =
    role === "ADMIN"
      ? "/admin"
      : role === "TECHNICIAN"
      ? "/technician"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => navigate(homePath)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#006591] text-white flex items-center justify-center font-bold text-xl shadow-md transition-transform group-hover:scale-105">
              EC
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                EduCore
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Facilities • Bookings • Support
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {loadingRole ? "Loading..." : role}
            </span>

            <div className="hidden md:block text-right pr-3 border-r border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.firstName || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </p>
            </div>

            <UserButton afterSignOutUrl="/login" />

            <button
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="hidden md:inline-flex items-center px-5 py-2 rounded-2xl border border-gray-300 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2 mt-5">
          {!loadingRole && role === "USER" && (
            <>
              <Link
                to="/dashboard"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/dashboard")}`}
              >
                <Home size={18} /> Dashboard
              </Link>

              <Link
                to="/resources"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/resources")}`}
              >
                <Building2 size={18} /> Resources
              </Link>

              <Link
                to="/my-bookings"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/my-bookings")}`}
              >
                <CalendarDays size={18} /> My Bookings
              </Link>

              <Link
                to="/create"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/create")}`}
              >
                <TicketPlus size={18} /> Create Ticket
              </Link>

              <Link
                to="/my-tickets"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/my-tickets")}`}
              >
                <ClipboardList size={18} /> My Tickets
              </Link>
            </>
          )}

          {!loadingRole && role === "TECHNICIAN" && (
            <>
              <Link
                to="/technician"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/technician")}`}
              >
                <Wrench size={18} /> Assigned Tickets
              </Link>
              <Link
                to="/resources"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/resources")}`}
              >
                <Building2 size={18} /> Resources
              </Link>
            </>
          )}

          {!loadingRole && role === "ADMIN" && (
            <>
              <Link
                to="/admin"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/admin")}`}
              >
                <ShieldCheck size={18} /> Admin
              </Link>
              <Link
                to="/resources"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/resources")}`}
              >
                <Building2 size={18} /> Resources
              </Link>
              <Link
                to="/admin/bookings"
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/admin/bookings")}`}
              >
                <CalendarDays size={18} /> Booking Review
              </Link>
            </>
          )}

          {!loadingRole && (
            <Link
              to="/notifications"
              className={`px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${isActive("/notifications")}`}
            >
              <Bell size={18} /> Notifications
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}