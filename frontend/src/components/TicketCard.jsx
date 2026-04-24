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
      className="group bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 
                 border border-gray-300 rounded-3xl overflow-hidden 
                 shadow-sm hover:shadow-xl hover:-translate-y-1 
                 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Card Header */}
      <div className="p-6 pb-4 border-b border-gray-300 bg-gray-100/80">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#006591] transition-colors line-clamp-2">
              {ticket.title}
            </h3>

            <div className="mt-2 mb-2 h-[1px] bg-gray-300" />

            <p className="text-gray-600 text-sm">
              {ticket.category} • {ticket.priority}
            </p>
          </div>

          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 space-y-5 text-sm bg-gray-50/70">
        <p className="text-gray-600 line-clamp-3">
          {ticket.description}
        </p>

        <InfoRow
          icon={<User className="w-5 h-5 text-gray-600" />}
          label="CREATED BY"
          value={
            <UserName
              clerkUserId={ticket.createdBy}
              currentUserId={user?.id}
            />
          }
        />

        {ticket.assignedTo && (
          <InfoRow
            icon={<Wrench className="w-5 h-5 text-gray-600" />}
            label="ASSIGNED TO"
            value={
              <UserName
                clerkUserId={ticket.assignedTo}
                currentUserId={user?.id}
              />
            }
          />
        )}

        <InfoRow
          icon={<Calendar className="w-5 h-5 text-gray-600" />}
          label="CREATED"
          value={
            ticket.createdAt
              ? format(new Date(ticket.createdAt), "MMM dd, yyyy • hh:mm a")
              : "—"
          }
        />

        {resolutionHours !== null && (
          <InfoRow
            icon={<TimerReset className="w-5 h-5 text-gray-600" />}
            label="RESOLVED IN"
            value={`${resolutionHours} hours`}
          />
        )}

        {/* 🔥 Highlighted Section */}
        <div className="pt-2 flex gap-4">
          {/* Comments */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl 
                          bg-blue-100 text-blue-700 text-xs font-semibold 
                          hover:bg-blue-200 transition">
            <MessageSquare size={16} />
            {ticket.comments?.length || 0} comments
          </div>

          {/* Attachments */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl 
                          bg-purple-100 text-purple-700 text-xs font-semibold 
                          hover:bg-purple-200 transition">
            <Paperclip size={16} />
            {ticket.attachments?.length || 0} attachments
          </div>
        </div>
      </div>
    </div>
  );
}

/* reusable row */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-gray-500 text-xs font-semibold tracking-wider">
          {label}
        </p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}