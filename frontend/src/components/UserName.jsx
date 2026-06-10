import { useEffect, useState } from "react";
import API from "../api/axios";

export default function UserName({ clerkUserId, currentUserId }) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadName = async () => {
      if (!clerkUserId) return;

      if (clerkUserId === currentUserId) {
        setDisplayName("You");
        return;
      }

      try {
        const res = await API.get(`/users/by-clerk/${clerkUserId}`);
        setDisplayName(res.data.name || res.data.email || clerkUserId);
      } catch (err) {
        setDisplayName(clerkUserId);
      }
    };

    loadName();
  }, [clerkUserId, currentUserId]);

  return <span>{displayName || "Loading..."}</span>;
}