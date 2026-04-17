import { useEffect, useState } from "react";
import API from "../api/axios";

function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    API.get("/tickets/user/user1")
      .then((res) => setTickets(res.data))
      .catch(console.log);
  }, []);

  return (
    <div>
      <h2>My Tickets</h2>

      {tickets.map((t) => (
        <div key={t.id}>
          <h4>{t.title}</h4>
          <p>{t.status}</p>
        </div>
      ))}
    </div>
  );
}

export default MyTickets;