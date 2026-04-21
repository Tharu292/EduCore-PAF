import { useState } from "react";
import { Send, Edit2, Trash2 } from "lucide-react";
import { addComment, updateComment, deleteComment } from "../services/ticketService";
import { format } from "date-fns";

export default function CommentSection({ ticket, currentUser = "user1", onUpdate }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addComment(ticket.id, { user: currentUser, message: text });
    setText("");
    onUpdate?.();
  };

  const handleEdit = async (commentId) => {
    await updateComment(ticket.id, commentId, { user: currentUser, message: editText });
    setEditingId(null);
    onUpdate?.();
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    await deleteComment(ticket.id, commentId, currentUser);
    onUpdate?.();
  };

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Send size={20} /> Comments ({ticket.comments?.length || 0})
      </h3>

      {/* Add Comment */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Send size={18} /> Send
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {ticket.comments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-5 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium">{comment.user}</span>
                <span className="text-xs text-gray-500 ml-3">
                  {format(new Date(comment.createdAt), "MMM dd, yyyy • HH:mm")}
                </span>
              </div>

              {comment.user === currentUser && (
                <div className="flex gap-3">
                  <button onClick={() => { setEditingId(comment.id); setEditText(comment.message); }}>
                    <Edit2 size={16} className="text-blue-600 hover:text-blue-800" />
                  </button>
                  <button onClick={() => handleDelete(comment.id)}>
                    <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                  </button>
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="flex gap-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button onClick={() => handleEdit(comment.id)} className="text-green-600">Save</button>
                <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
              </div>
            ) : (
              <p className="text-gray-700">{comment.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}