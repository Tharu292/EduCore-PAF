import {
  MapPin,
  Users,
  Calendar,
  Package,
  Edit2,
  Trash2,
} from "lucide-react";

function ResourceList({ resources, onDelete, onEdit, isAdmin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No resources found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        resources.map((r) => (
          <div
            key={r.id}
            className="group bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 
                       border border-gray-300 rounded-3xl overflow-hidden 
                       shadow-sm hover:shadow-xl hover:-translate-y-1
                       transition-all duration-300 flex flex-col
                       hover:border-gray-400 active:scale-[0.985]"
          >
            {/* Card Header */}
            <div className="p-6 pb-4 border-b border-gray-300 bg-gray-100/80">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#006591] transition-colors">
                    {r.name}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {r.location}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center px-3.5 py-1 text-xs font-semibold rounded-2xl whitespace-nowrap ${
                    r.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {r.status === "ACTIVE" ? "Active" : "Out of Service"}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 space-y-5 text-sm bg-gray-50/70">
              <InfoRow
                icon={<Package className="w-5 h-5 text-gray-600" />}
                label="TYPE"
                value={r.type}
              />

              <InfoRow
                icon={<Users className="w-5 h-5 text-gray-600" />}
                label="CAPACITY"
                value={`${r.capacity} people`}
              />

              <InfoRow
                icon={<Calendar className="w-5 h-5 text-gray-600" />}
                label="AVAILABILITY"
                value={r.availability}
              />
            </div>

            {/* Admin Actions Footer */}
            {isAdmin && (
              <div className="border-t border-gray-300 bg-gray-100 px-6 py-4 flex gap-3">
                <button
                  onClick={() => onEdit(r)}
                  className="flex-1 flex items-center justify-center gap-2 
                             bg-white hover:bg-amber-50 border border-gray-300 
                             hover:border-amber-300 text-amber-700 py-2.5 
                             rounded-2xl text-sm font-medium transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => onDelete(r.id)}
                  className="flex-1 flex items-center justify-center gap-2 
                             bg-white hover:bg-red-50 border border-gray-300 
                             hover:border-red-300 text-red-700 py-2.5 
                             rounded-2xl text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-gray-500 text-xs font-semibold tracking-wider">
          {label}
        </p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default ResourceList;