import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

function SearchFilter({ onFilter }) {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: ""
  });

  // Live filtering as user types
  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = { search: "", type: "", status: "" };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.type || filters.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 rounded-xl">
            <Filter className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="font-semibold text-zinc-800 text-lg">Search & Filter</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="md:col-span-7">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search by name or location..."
              value={filters.search}
              onChange={handleChange}
              className="w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Type Dropdown */}
        <div className="md:col-span-3">
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors appearance-none"
          >
            <option value="">All Types</option>
            <option value="LAB">Laboratory</option>
            <option value="ROOM">Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-2">
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors appearance-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Optional: Show active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.search && (
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-sm px-4 py-1.5 rounded-2xl">
              <span>Search: {filters.search}</span>
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {filters.type && (
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-sm px-4 py-1.5 rounded-2xl">
              Type: {filters.type}
              <button
                onClick={() => setFilters({ ...filters, type: "" })}
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {filters.status && (
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-sm px-4 py-1.5 rounded-2xl">
              Status: {filters.status.replace("_", " ")}
              <button
                onClick={() => setFilters({ ...filters, status: "" })}
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;