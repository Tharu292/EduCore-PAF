import { Link, useLocation, useNavigate } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("smartCampusUser") || "{}");

  const isActive = (path) => location.pathname === path;
  const logout = () => {
    localStorage.removeItem("smartCampusUser");
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="text-xl font-bold">Smart Campus</h1>

        {/* Links */}
        <div className="flex gap-4 items-center">
          {!currentUser?.email && (
            <>
              <Link to="/" className={linkClass(isActive("/"))}>Login</Link>
              <Link to="/register" className={linkClass(isActive("/register"))}>Register</Link>
            </>
          )}
          {currentUser?.role === "ADMIN" && (
            <Link to="/admin" className={linkClass(isActive("/admin"))}>Admin Dashboard</Link>
          )}
          {currentUser?.role === "STUDENT" && (
            <Link to="/user" className={linkClass(isActive("/user"))}>Student Dashboard</Link>
          )}
          {currentUser?.email && (
            <button onClick={logout} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
              Logout
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

// 🔥 Clean Tailwind styling
const linkClass = (active) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    active
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white"
  }`;
