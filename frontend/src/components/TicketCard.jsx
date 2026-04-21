import { MessageSquare, Paperclip, Calendar, User } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";

export default function TicketCard({ ticket, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {ticket.title}
        </h3>
        <StatusBadge status={ticket.status} />
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{ticket.description}</p>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <User size={16} />
          <span>{ticket.createdBy}</span>
        </div>
        {ticket.assignedTo && (
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-amber-600" />
            <span className="text-amber-600">Assigned: {ticket.assignedTo}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={16} />
          <span>{ticket.createdAt ? format(new Date(ticket.createdAt), "MMM dd") : "—"}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-6 text-xs text-gray-500">
        {ticket.comments?.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            {ticket.comments.length} comments
          </div>
        )}
        {ticket.attachments?.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip size={16} />
            {ticket.attachments.length} attachments
          </div>
        )}
      </div>
    </div>
  );
}