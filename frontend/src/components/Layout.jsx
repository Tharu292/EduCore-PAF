import { Link, useLocation } from "react-router-dom";
import { Ticket, PlusCircle, User, Users, LogOut, Home } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/create", label: "Create Ticket", icon: PlusCircle },
  { path: "/my-tickets", label: "My Tickets", icon: User },
  { path: "/technician", label: "Technician View", icon: Users },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Ticket className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-2xl">SmartCampus</h1>
              <p className="text-xs text-gray-500 -mt-1">Ticket System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 bg-gray-200 rounded-full" />
            <div>
              <p className="font-medium">Tharushi</p>
              <p className="text-xs text-gray-500">Student / User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b px-10 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-gray-900">Support Tickets</h2>
          <div className="text-sm text-gray-500">Negombo Campus • {new Date().toLocaleDateString()}</div>
        </header>
        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}