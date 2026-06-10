import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";

import AppLayout from "../components/AppLayout";
import SearchFilter from "../components/SearchFilter";
import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import BookingModal from "../components/BookingModal";
import Toast from "../components/Toast";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from "../api/resourceApi";

export default function ResourcePage() {
  const { role } = useCurrentUserRole();
  const isAdmin = role === "ADMIN";

  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingResource, setBookingResource] = useState(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await getResources();
      const data = Array.isArray(res.data) ? res.data : [];
      setResources(data);
      setFilteredResources(data);
    } catch (err) {
      showToast("Failed to load resources", "error");
      setResources([]);
      setFilteredResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleFilter = useCallback(
    (filters) => {
      const q = (filters.search || "").toLowerCase().trim();

      const result = resources.filter((r) => {
        const matchesSearch =
          !q ||
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q);

        const matchesType =
          !filters.type || r.type === filters.type;

        const matchesStatus =
          !filters.status || r.status === filters.status;

        return matchesSearch && matchesType && matchesStatus;
      });

      setFilteredResources(result);
    },
    [resources]
  );

  const openAddModal = () => {
    setSelectedResource(null);
    setShowResourceModal(true);
  };

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const closeResourceModal = () => {
    setSelectedResource(null);
    setShowResourceModal(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedResource) {
        await updateResource(selectedResource.id, formData);
        showToast("Resource updated successfully");
      } else {
        await createResource(formData);
        showToast("Resource created successfully");
      }

      closeResourceModal();
      loadResources();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save resource", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await deleteResource(id);
      showToast("Resource deleted successfully");
      loadResources();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete resource", "error");
    }
  };

  const headerTitle = useMemo(() => {
    return isAdmin
      ? "Facilities & Assets Catalogue"
      : "Browse & Book Campus Resources";
  }, [isAdmin]);

  return (
    <AppLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-3xl p-8 md:p-5 text-white shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">
              {headerTitle}
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Search lecture halls, labs, meeting rooms, and equipment by type, location, and status.
            </p>
          </div>

          <div className="absolute top-6 right-8 opacity-10">
            <div className="w-32 h-32 border-8 border-white rounded-full" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <SearchFilter onFilter={handleFilter} />
        </div>

        <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Resource Catalogue
              </h2>
              <p className="text-gray-500 text-base mt-1">
                {loading
                  ? "Loading resources..."
                  : `${filteredResources.length} resources available`}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 bg-[#006591] hover:bg-[#005170] text-white px-5 py-3 rounded-2xl font-semibold shadow-sm transition"
              >
                <Plus size={18} />
                Add Resource
              </button>
            )}
          </div>

          <ResourceList
            resources={filteredResources}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onBook={(resource) => setBookingResource(resource)}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {showResourceModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden relative">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedResource ? "Edit Resource" : "Add New Resource"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill resource details such as type, capacity, location, availability and status.
                </p>
              </div>

              <button
                onClick={closeResourceModal}
                className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[78vh]">
              <ResourceForm
                onSubmit={handleSubmit}
                selectedResource={selectedResource}
              />
            </div>
          </div>
        </div>
      )}

      {bookingResource && (
        <BookingModal
          resource={bookingResource}
          onClose={() => setBookingResource(null)}
          onBooked={loadResources}
          showToast={showToast}
        />
      )}
    </AppLayout>
  );
}