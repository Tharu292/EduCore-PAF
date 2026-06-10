import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { registerStudent } from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerStudent(form);
      localStorage.setItem("smartCampusUser", JSON.stringify(res.data));
      toast.success("Student account created");
      navigate("/user");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-md bg-white border border-zinc-100 shadow-sm rounded-2xl p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-semibold text-zinc-900">Student Registration</h1>
          <p className="text-zinc-500 mt-2">Create an account to request facilities and equipment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>
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
              minLength="4"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-medium disabled:opacity-70"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <Link to="/" className="block text-center mt-6 text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
