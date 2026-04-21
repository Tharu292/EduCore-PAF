import { CheckCircle, Clock, AlertCircle, XCircle, Ban } from "lucide-react";

const statusConfig = {
  OPEN: { color: "bg-blue-100 text-blue-700", icon: Clock },
  IN_PROGRESS: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  RESOLVED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  CLOSED: { color: "bg-gray-100 text-gray-700", icon: XCircle },
  REJECTED: { color: "bg-red-100 text-red-700", icon: Ban },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.OPEN;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon size={16} />
      {status.replace("_", " ")}
    </span>
  );
}