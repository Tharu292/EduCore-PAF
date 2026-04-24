import { useEffect, useState } from "react";
import API from "../api/axios";
import { getTicketsByTechnician } from "../services/ticketService";

async function loadTechnicianTickets(setTickets) {
  try {
    const res = await getTicketsByTechnician("tech1");
    setTickets(res.data);
  } catch (err) {
    console.log(err);
  }
}

function TechnicianTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadTechnicianTickets(setTickets);
  }, []);

  const updateStatus = async (id) => {
    try {
      await API.put(`/tickets/${id}/status?status=RESOLVED`);
      await loadTechnicianTickets(setTickets);
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

          <button onClick={() => updateStatus(t.id)}>Mark Resolved</button>
        </div>
      ))}
    </div>
  );
}

export default TechnicianTickets;
