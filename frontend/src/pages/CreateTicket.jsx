import { useState } from "react";
import { createTicket } from "../services/ticketService";
import { useNavigate } from "react-router-dom";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "EQUIPMENT",
    priority: "MEDIUM",
    createdBy: "user1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket(form);
      alert("Ticket created successfully!");
      navigate("/my-tickets");
    } catch (err) {
      console.error(err);
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow">
      <h2 className="text-3xl font-semibold mb-8">Create New Support Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            required
            placeholder="Brief title of your issue"
            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            rows={6}
            placeholder="Describe the problem in detail..."
            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="EQUIPMENT">Equipment</option>
              <option value="NETWORK">Network</option>
              <option value="SOFTWARE">Software</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl"
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}