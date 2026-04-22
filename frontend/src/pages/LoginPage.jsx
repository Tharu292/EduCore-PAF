import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { login } from "../api/authApi";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const user = res.data;
      localStorage.setItem("smartCampusUser", JSON.stringify(user));
      toast.success(`Welcome ${user.name}`);
      navigate(user.role === "ADMIN" ? "/admin" : "/user");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setForm({ email: "admin@smartcampus.lk", password: "admin123" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-md bg-white border border-zinc-100 shadow-sm rounded-2xl p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold text-zinc-900">Smart Campus Login</h1>
          <p className="text-zinc-500 mt-2">Students can book resources. Admin can review requests.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white rounded-2xl py-3 font-medium disabled:opacity-70"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={fillAdmin}
            className="flex items-center justify-center gap-2 border border-amber-200 bg-amber-50 text-amber-800 rounded-2xl py-3 font-medium"
          >
            <ShieldCheck className="w-5 h-5" />
            Use Admin Login
          </button>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-2xl py-3 font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
