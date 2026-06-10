import { useState } from "react";
import { Send, Edit2, Trash2 } from "lucide-react";
import { addComment, updateComment, deleteComment } from "../services/ticketService";
import { format } from "date-fns";
import UserName from "./UserName";

export default function CommentSection({ ticket, currentUserId, onUpdate, showToast }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addComment(ticket.id, { message: text.trim() });
      setText("");
      onUpdate();
      showToast?.("Comment added successfully", "success");
    } catch (err) {
      showToast?.(err.response?.data?.error || "Failed to add comment", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await updateComment(ticket.id, commentId, { message: editText.trim() });
      setEditingId(null);
      setEditText("");
      onUpdate();
      showToast?.("Comment updated successfully", "success");
    } catch (err) {
      showToast?.(err.response?.data?.error || "Failed to update comment", "error");
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(ticket.id, commentId);
      onUpdate();
      showToast?.("Comment deleted successfully", "success");
    } catch (err) {
      showToast?.(err.response?.data?.error || "Failed to delete comment", "error");
    }
  };

  return (
    <div className="mt-12">
      <h3 className="font-semibold text-xl mb-6">Comments ({ticket.comments?.length || 0})</h3>

      <div className="flex gap-3 mb-10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || loading}
          className="bg-blue-600 text-white px-8 rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={18} /> Send
        </button>
      </div>

      <div className="space-y-6">
        {ticket.comments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-6 rounded-3xl">
            <div className="flex justify-between gap-3">
              <div>
                <span className="font-medium">
                  <UserName clerkUserId={comment.user} currentUserId={currentUserId} />
                </span>
                <span className="text-xs text-gray-500 ml-4">
                  {comment.createdAt
                    ? format(new Date(comment.createdAt), "MMM dd, yyyy • hh:mm a")
                    : ""}
                </span>
              </div>

              {comment.user === currentUserId && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.message);
                    }}
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(comment.id)}>
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="mt-4 flex gap-3">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-2xl px-5 py-3"
                />
                <button onClick={() => handleEdit(comment.id)} className="text-green-600 font-medium">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-700 mt-2">{comment.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}