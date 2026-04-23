import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Analytics({ resources }) {

  // 📊 SUMMARY
  const total = resources.length;
  const active = resources.filter(r => r.status === "ACTIVE").length;
  const out = resources.filter(r => r.status === "OUT_OF_SERVICE").length;

  // 🏆 TOP RESOURCES (by capacity)
  const topResources = [...resources]
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 5);

  return (
    <div className="mb-6">

      {/* 🔢 CARDS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="text-gray-500">Total Resources</h4>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-xl">
          <h4 className="text-green-700">Active</h4>
          <p className="text-2xl font-bold">{active}</p>
        </div>

        <div className="bg-red-100 p-4 rounded-xl">
          <h4 className="text-red-700">Out of Service</h4>
          <p className="text-2xl font-bold">{out}</p>
        </div>

      </div>

      {/* 📊 BAR CHART */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Top Resources (Capacity)</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topResources}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="capacity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Analytics;