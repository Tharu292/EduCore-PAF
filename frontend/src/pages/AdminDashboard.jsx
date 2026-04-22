import { useEffect, useState, useCallback } from "react";
import {
  getResources,
  createResource,
  deleteResource,
  updateResource
} from "../api/resourceApi";
import {
  getAllBookings,
  approveBooking,
  rejectBooking
} from "../api/bookingApi";

import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import SearchFilter from "../components/SearchFilter";
import toast from "react-hot-toast";
import Analytics from "../components/Analytics";

import { 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  Package, 
  Users, 
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  XCircle
} from "lucide-react";

function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [reviewReasons, setReviewReasons] = useState({});

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

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getAllBookings(bookingStatus);
      setBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  }, [bookingStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const setReason = (bookingId, reason) => {
    setReviewReasons({ ...reviewReasons, [bookingId]: reason });
  };

  const handleApprove = async (bookingId) => {
    try {
      await approveBooking(bookingId, reviewReasons[bookingId] || "Approved");
      toast.success("Booking approved");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (bookingId) => {
    const reason = reviewReasons[bookingId] || "";
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      await rejectBooking(bookingId, reason);
      toast.success("Booking rejected");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
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
            <button
              onClick={fetchResources}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-700 disabled:opacity-70 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
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

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden mb-10">
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-800">Booking Requests</h2>
            </div>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="border border-zinc-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-400"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="p-8">
            {bookings.length === 0 ? (
              <p className="text-zinc-500">No booking requests found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-zinc-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{booking.resourceName}</h3>
                        <p className="text-sm text-zinc-500">{booking.resourceLocation}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-2xl ${
                        booking.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                        booking.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        booking.status === "CANCELLED" ? "bg-zinc-100 text-zinc-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p><span className="text-zinc-500">Student:</span> {booking.studentName}</p>
                      <p><span className="text-zinc-500">Attendees:</span> {booking.expectedAttendees}</p>
                      <p><span className="text-zinc-500">Date:</span> {booking.bookingDate}</p>
                      <p><span className="text-zinc-500">Time:</span> {booking.startTime} - {booking.endTime}</p>
                    </div>

                    <p className="mt-4 text-sm text-zinc-700">{booking.purpose}</p>
                    {booking.adminReason && (
                      <p className="mt-3 text-sm text-zinc-500">Reason: {booking.adminReason}</p>
                    )}

                    {booking.status === "PENDING" && (
                      <div className="mt-5 space-y-3">
                        <input
                          value={reviewReasons[booking.id] || ""}
                          onChange={(e) => setReason(booking.id, e.target.value)}
                          placeholder="Approval or rejection reason"
                          className="w-full border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-2.5 text-sm font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-2.5 text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
