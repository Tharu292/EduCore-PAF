import {
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Wrench,
  TimerReset,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { format } from "date-fns";
import UserName from "./UserName";
import { useUser } from "@clerk/clerk-react";

function getResolutionHours(ticket) {
  if (!ticket?.createdAt || !ticket?.resolvedAt) return null;
  const ms =
    new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime();
  return Math.max(Math.floor(ms / 3600000), 0);
}

export default function TicketCard({ ticket, onClick }) {
  const { user } = useUser();
  const resolutionHours = getResolutionHours(ticket);

  return (
    <div
      onClick={onClick}
      className="group bg-blue-50 hover:bg-white border border-blue-100 hover:border-blue-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="p-6 pb-4 border-b border-blue-100">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 leading-tight group-hover:text-blue-700 transition-colors">
              {ticket.title}
            </h3>
            <p className="text-zinc-500 text-sm mt-1">
              {ticket.category} • {ticket.priority}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="p-6 space-y-4 text-sm">
        <p className="text-zinc-700 line-clamp-2">{ticket.description}</p>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <User className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium">CREATED BY</p>
            <p className="font-medium text-zinc-800">
              <UserName clerkUserId={ticket.createdBy} currentUserId={user?.id} />
            </p>
          </div>
        </div>

        {ticket.assignedTo && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Wrench className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium">ASSIGNED TO</p>
              <p className="font-medium text-zinc-800">
                <UserName clerkUserId={ticket.assignedTo} currentUserId={user?.id} />
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium">CREATED</p>
            <p className="font-medium text-zinc-800">
              {ticket.createdAt
                ? format(new Date(ticket.createdAt), "MMM dd, yyyy • hh:mm a")
                : "—"}
            </p>
          </div>
        </div>

        {resolutionHours !== null && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <TimerReset className="w-4 h-4 text-zinc-600" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium">RESOLUTION TIME</p>
              <p className="font-medium text-zinc-800">{resolutionHours} hrs</p>
            </div>
          </div>
        )}

        <div className="mt-2 flex gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <MessageSquare size={16} />
            {ticket.comments?.length || 0} comments
          </div>
          <div className="flex items-center gap-1">
            <Paperclip size={16} />
            {ticket.attachments?.length || 0} attachments
          </div>
        </div>
      </div>
    </div>
  );
}