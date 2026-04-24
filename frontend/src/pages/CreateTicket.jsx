import { useState } from "react";
import API from "../api/axios";

function CreateTicket() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "EQUIPMENT",
    priority: "LOW",
    createdBy: "user1",
  });

  // Add comment

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tickets", form);
      alert("Ticket Created");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Ticket</h2>

      <input placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <input placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <button type="submit">Create</button>
    </form>
  );
}

export default CreateTicket;