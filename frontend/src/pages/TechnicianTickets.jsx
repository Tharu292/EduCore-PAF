import { useEffect, useState } from "react";
import { getTicketsByTechnician } from "../services/ticketService";
import API from "../api/axios";

function TechnicianTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await getTicketsByTechnician("tech1");
      setTickets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id) => {
    try {
      // ✅ FIXED: send status as query param
      await API.put(`/tickets/${id}/status?status=RESOLVED`);

      // reload tickets after update
      loadTickets();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Assigned Tickets</h2>

      {tickets.map((t) => (
        <div key={t.id}>
          <h4>{t.title}</h4>
          <p>Status: {t.status}</p>

          <button onClick={() => updateStatus(t.id)}>
            Mark Resolved
          </button>
        </div>
      ))}
    </div>
  );
}

export default TechnicianTickets;