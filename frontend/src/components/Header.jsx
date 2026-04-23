import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import {
  Bell,
  ShieldCheck,
  Wrench,
  Home,
  ClipboardList,
  Building2,
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
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100";

  const handleLogoClick = () => {
    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "TECHNICIAN") {
      navigate("/technician");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
              SC
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Campus</h1>
              <p className="text-xs text-gray-500">
                Facilities, Bookings & Ticketing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {loadingRole ? "Loading..." : role}
            </span>

            <div className="hidden md:block text-right">
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
              className="hidden md:inline-flex px-4 py-2 rounded-2xl border border-gray-300 text-sm font-medium hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {!loadingRole && role !== "ADMIN" && (
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
                "/dashboard"
              )}`}
            >
              <Home size={16} />
              Dashboard
            </Link>
          )}

          <Link
            to="/resources"
            className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
              "/resources"
            )}`}
          >
            <Building2 size={16} />
            Resources
          </Link>

          <Link
            to="/my-tickets"
            className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
              "/my-tickets"
            )}`}
          >
            <ClipboardList size={16} />
            My Tickets
          </Link>

          <Link
            to="/notifications"
            className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
              "/notifications"
            )}`}
          >
            <Bell size={16} />
            Notifications
          </Link>

          {!loadingRole && role === "TECHNICIAN" && (
            <Link
              to="/technician"
              className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
                "/technician"
              )}`}
            >
              <Wrench size={16} />
              Technician
            </Link>
          )}

          {!loadingRole && role === "ADMIN" && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 ${isActive(
                "/admin"
              )}`}
            >
              <ShieldCheck size={16} />
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}