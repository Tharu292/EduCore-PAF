import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics({ resources = [], bookings = [] }) {
  const total = resources.length;
  const active = resources.filter((r) => r.status === "ACTIVE").length;
  const out = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;

  const groupedResources = {};
  bookings.forEach((b) => {
    const key = b.resourceName || "Unknown";
    groupedResources[key] = (groupedResources[key] || 0) + 1;
  });

  const topBookedResources = Object.entries(groupedResources)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const groupedHours = {};
  bookings.forEach((b) => {
    if (!b.startTime) return;
    const hour = String(b.startTime).slice(0, 2);
    groupedHours[hour] = (groupedHours[hour] || 0) + 1;
  });

  const peakHours = Object.entries(groupedHours)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow">
          <h4 className="text-gray-500">Total Resources</h4>
          <p className="text-3xl font-bold mt-2">{total}</p>
        </div>

        <div className="bg-green-100 p-5 rounded-3xl">
          <h4 className="text-green-700">Active Resources</h4>
          <p className="text-3xl font-bold mt-2">{active}</p>
        </div>

        <div className="bg-red-100 p-5 rounded-3xl">
          <h4 className="text-red-700">Out of Service</h4>
          <p className="text-3xl font-bold mt-2">{out}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow">
        <h3 className="font-semibold mb-4 text-lg">Top Booked Resources</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topBookedResources}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow">
        <h3 className="font-semibold mb-4 text-lg">Peak Booking Hours</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={peakHours}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;