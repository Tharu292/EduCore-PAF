import { useEffect, useState } from "react";
import {
  getResources,
  createResource,
  deleteResource,
  updateResource
} from "../api/resourceApi";

import ResourceForm from "../components/ResourceForm";
import ResourceList from "../components/ResourceList";
import SearchFilter from "../components/SearchFilter";

function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);

  const fetchResources = async () => {
    const res = await getResources();
    setResources(res.data);
    setFiltered(res.data);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (data) => {
    if (selectedResource) {
      await updateResource(selectedResource.id, data);
      setSelectedResource(null);
    } else {
      await createResource(data);
    }
    fetchResources();
  };

  const handleDelete = async (id) => {
    await deleteResource(id);
    fetchResources();
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
  };

  const handleFilter = (filters) => {
    let result = [...resources];

    if (filters.search) {
      const searchText = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(searchText) ||
          r.location.toLowerCase().includes(searchText)
      );
    }

    if (filters.type) {
      result = result.filter(
        (r) => r.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.status) {
      result = result.filter(
        (r) => r.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFiltered(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 p-6">
      
      {/* 🔷 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Smart Campus Dashboard
          </h1>
          <p className="text-gray-500">
            Manage facilities, labs, and equipment efficiently
          </p>
        </div>

        {/* 🔘 ROLE SWITCH */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`mt-4 md:mt-0 px-5 py-2 rounded-lg font-semibold shadow-md transition ${
            isAdmin
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          Switch to {isAdmin ? "User View" : "Admin View"}
        </button>
      </div>

      {/* 🔍 SEARCH SECTION CARD */}
      <div className="bg-white shadow-lg rounded-2xl p-5 mb-6">
        <SearchFilter onFilter={handleFilter} />
      </div>

      {/* ➕ FORM CARD (ONLY ADMIN) */}
      {isAdmin && (
        <div className="bg-white shadow-lg rounded-2xl p-5 mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            {selectedResource ? "Update Resource" : "Add New Resource"}
          </h2>

          <ResourceForm
            onSubmit={handleSubmit}
            selectedResource={selectedResource}
          />
        </div>
      )}

      {/* 📋 LIST SECTION */}
      <div className="bg-white shadow-lg rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Resource Catalogue
          </h2>

          <span className="text-sm text-gray-500">
            Total: {filtered.length}
          </span>
        </div>

        <ResourceList
          resources={filtered}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

export default ResourcePage; 