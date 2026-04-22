import { useEffect, useState, useCallback } from "react";
import {
  getResources,
  createResource,
  deleteResource,
  updateResource
} from "../api/resourceApi";

import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import SearchFilter from "../components/SearchFilter";
import toast from "react-hot-toast";
import Analytics from "../components/Analytics";
import { Link } from "react-router-dom";

import { 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  Package, 
  Users, 
  AlertTriangle,
  CalendarClock
} from "lucide-react";

function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getResources();
      const data = res?.data || [];
      setResources(data);
      setFiltered(data);
    } catch (error) {
      toast.error("Failed to load resources");
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
      const searchText = filters.search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(searchText) ||
          (r.location || "").toLowerCase().includes(searchText)
      );
    }

    if (filters?.type) {
      result = result.filter((r) => (r.type || "") === filters.type);
    }

    if (filters?.status) {
      result = result.filter((r) => (r.status || "") === filters.status);
    }

    setFiltered(result);
  }, [resources]);

  const openAddForm = () => {
    setSelectedResource(null);
    setShowFormModal(true);
  };

  const openEditForm = (resource) => {
    setSelectedResource(resource);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedResource(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedResource) {
        await updateResource(selectedResource.id, data);
        toast.success("Resource updated successfully");
      } else {
        await createResource(data);
        toast.success("Resource created successfully");
      }
      fetchResources();
      closeFormModal();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(id);
      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (error) {
      toast.error("Delete failed");
    }
  };


  const activeResources = resources.filter(r => r.status === "ACTIVE").length;
  const outOfService = resources.filter(r => r.status === "OUT_OF_SERVICE").length;

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500">Welcome back,</p>
              <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/bookings"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium transition-colors"
              >
                <CalendarClock className="w-4 h-4" />
                Booking Management
              </Link>
              <button
                onClick={fetchResources}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-700 disabled:opacity-70 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
          <p className="text-zinc-600 mt-2">Manage all campus resources efficiently</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-zinc-900">{resources.length}</p>
                <p className="text-sm text-zinc-500">Total Resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-zinc-900">{activeResources}</p>
                <p className="text-sm text-zinc-500">Active Resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-zinc-900">{outOfService}</p>
                <p className="text-sm text-zinc-500">Out of Service</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-zinc-900">{filtered.length}</p>
                <p className="text-sm text-zinc-500">Currently Showing</p>
              </div>
            </div>
          </div>
        </div>
        <Analytics resources={resources} />

        {/* Search & Filter */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 mb-8">
          
          <SearchFilter onFilter={handleFilter} />
        </div>

        {/* Add Resource Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddForm}
            className="flex items-center gap-3 bg-zinc-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-medium transition-all shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Add New Resource
          </button>
        </div>

        {/* Resources List */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800">All Resources</h2>
            {filtered.length !== resources.length && (
              <p className="text-sm text-zinc-500">
                {filtered.length} resources shown
              </p>
            )}
          </div>

          <div className="p-8">
            <ResourceList
              resources={filtered}
              onDelete={handleDelete}
              onEdit={openEditForm}
              isAdmin={true}
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden relative">
            
            <div className="p-8 overflow-y-auto max-h-[92vh]">
              <ResourceForm
                onSubmit={handleSubmit}
                selectedResource={selectedResource}
                onCancel={closeFormModal}   
              />
            </div>

            {/* Close Button */}
            <button
              onClick={closeFormModal}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 text-2xl leading-none transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
