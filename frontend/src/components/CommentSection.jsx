import { useState } from "react";
import { addComment } from "../services/ticketService";

function CommentSection({ ticketId }) {
  const [text, setText] = useState("");

  const submit = async () => {
    await addComment(ticketId, {
      user: "user1",
      message: text,
    });
  };

  return (
    <div>
      <input onChange={(e) => setText(e.target.value)} />
      <button onClick={submit}>Add Comment</button>
    </div>
  );
}

export default CommentSection;