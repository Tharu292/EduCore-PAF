import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import SearchFilter from "../components/SearchFilter";
import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import BookingModal from "../components/BookingModal";
import Toast from "../components/Toast";
import useCurrentUserRole from "../hooks/useCurrentUserRole";
import {
  getResources,
  searchResources,
  createResource,
  updateResource,
  deleteResource,
} from "../api/resourceApi";

export default function ResourcePage() {
  const { role } = useCurrentUserRole();
  const isAdmin = role === "ADMIN";

  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingResource, setBookingResource] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await getResources();
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load resources", "error");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleFilter = async (filters) => {
    try {
      const res = await searchResources({
        type: filters.type || undefined,
        status: filters.status || undefined,
      });

      const backendResources = Array.isArray(res.data) ? res.data : [];
      const localFiltered = backendResources.filter((r) => {
        const q = (filters.search || "").toLowerCase();
        return (
          !q ||
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q)
        );
      });

      setSearchTerm(filters.search || "");
      setResources(localFiltered);
    } catch (err) {
      showToast("Search failed", "error");
    }
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

      setSelectedResource(null);
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
    if (isAdmin) return "Facilities & Assets Catalogue";
    return "Browse & Book Campus Resources";
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

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900">{headerTitle}</h1>
        <p className="text-zinc-500 mt-2">
          Search lecture halls, labs, meeting rooms, and equipment by type, location, and status.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-3xl p-6 mb-6">
        <SearchFilter onFilter={handleFilter} />
      </div>

      {isAdmin && (
        <div className="bg-white shadow-lg rounded-3xl p-6 mb-6 border-l-4 border-blue-500">
          <ResourceForm
            onSubmit={handleSubmit}
            selectedResource={selectedResource}
          />
        </div>
      )}

      <div className="bg-white shadow-lg rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-zinc-800">
            Resource Catalogue
          </h2>
          <span className="text-sm text-zinc-500">
            {loading ? "Loading..." : `Total: ${resources.length}`}
          </span>
        </div>

        <ResourceList
          resources={resources}
          onDelete={handleDelete}
          onEdit={setSelectedResource}
          onBook={(resource) => setBookingResource(resource)}
          isAdmin={isAdmin}
        />
      </div>

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