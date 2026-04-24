import { Link } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import useCurrentUserRole from "../hooks/useCurrentUserRole";
import {
  Home,
  Building2,
  CalendarDays,
  TicketPlus,
  ClipboardList,
  Wrench,
  ShieldCheck,
  Bell,
} from "lucide-react";

export default function Footer() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role, loadingRole } = useCurrentUserRole();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#006591] text-white flex items-center justify-center font-bold text-xl">
                EC
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">EduCore</h3>
                <p className="text-xs text-gray-400">Campus Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Streamlining facilities, bookings, and support for a smarter campus.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-medium text-white mb-4">Quick Links</h4>
            <div className="space-y-2.5 text-sm">
              {!loadingRole && role === "USER" && (
                <>
                  <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                  <Link to="/resources" className="block text-gray-400 hover:text-white transition-colors">Resources</Link>
                  <Link to="/my-bookings" className="block text-gray-400 hover:text-white transition-colors">My Bookings</Link>
                  <Link to="/create" className="block text-gray-400 hover:text-white transition-colors">Create Ticket</Link>
                  <Link to="/my-tickets" className="block text-gray-400 hover:text-white transition-colors">My Tickets</Link>
                </>
              )}

              {!loadingRole && role === "TECHNICIAN" && (
                <>
                  <Link to="/technician" className="block text-gray-400 hover:text-white transition-colors">Assigned Tickets</Link>
                  <Link to="/resources" className="block text-gray-400 hover:text-white transition-colors">Resources</Link>
                </>
              )}

              {!loadingRole && role === "ADMIN" && (
                <>
                  <Link to="/admin" className="block text-gray-400 hover:text-white transition-colors">Admin Dashboard</Link>
                  <Link to="/resources" className="block text-gray-400 hover:text-white transition-colors">Resources</Link>
                  <Link to="/admin/bookings" className="block text-gray-400 hover:text-white transition-colors">Booking Review</Link>
                </>
              )}

              <Link to="/notifications" className="block text-gray-400 hover:text-white transition-colors">Notifications</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium text-white mb-4">Support</h4>
            <div className="space-y-2.5 text-sm">
              <Link to="/my-tickets" className="block text-gray-400 hover:text-white transition-colors">My Tickets</Link>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Admin</a>
            </div>
          </div>

          {/* Legal & Account */}
          <div>
            <h4 className="font-medium text-white mb-4">Account</h4>
            <div className="space-y-2.5 text-sm">
              <button
                onClick={() => signOut({ redirectUrl: "/login" })}
                className="block text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              <span className="block text-gray-400">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>

            <div className="mt-8">
              <p className="text-xs text-gray-500">
                © 2026 EduCore • PAF Assignment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500 bg-black">
        Smart  Campus  Operations  Hub  •  Resources, Bookings, Support
      </div>
    </footer>
  );
}