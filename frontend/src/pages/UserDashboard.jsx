import { useEffect, useState, useCallback } from "react";
import { getResources } from "../api/resourceApi";
import ResourceList from "../components/ResourceList";
import SearchFilter from "../components/SearchFilter";
import {
  LayoutDashboard,
  RefreshCw,
  Search,
  Package
} from "lucide-react";

function UserDashboard() {
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getResources();
      const data = res?.data || [];
      setResources(data);
      setFiltered(data);
    } catch (err) {
      console.error("API ERROR:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFilter = useCallback((filters) => {
    let result = [...resources];

    if (filters?.search?.trim()) {
      const s = filters.search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(s) ||
          (r.location || "").toLowerCase().includes(s)
      );
    }

    if (filters?.type) {
      result = result.filter(
        (r) => (r.type || "").toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters?.status) {
      result = result.filter(
        (r) => (r.status || "").toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFiltered(result);
  }, [resources]);

  const clearFilters = () => {
    setFiltered(resources);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Welcome Banner - Blue Background */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-9 h-9" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                Welcome back, Nishadi!
              </h1>
              <p className="text-blue-100 mt-3 text-lg">
                Browse and reserve available campus resources easily.
              </p>
            </div>
          </div>
        </div>

        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Available Resources</h2>
            <p className="text-zinc-500">Find labs, rooms, and equipment</p>
          </div>

          <button
            onClick={fetchResources}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-700 transition-colors disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search & Filter Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 mb-10">
          <SearchFilter onFilter={handleFilter} />
        </div>

        {/* Resources List Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-zinc-500" />
              <h3 className="text-lg font-semibold text-zinc-800">All Resources</h3>
            </div>

            {filtered.length !== resources.length && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="p-8">
            <ResourceList
              resources={filtered}
              isAdmin={false}
            />
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-800 mb-2">No matching resources found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-medium rounded-2xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;