import { 
  MapPin, 
  Users, 
  Calendar, 
  Package, 
  Edit2, 
  Trash2 
} from "lucide-react";

function ResourceList({ resources, onDelete, onEdit, isAdmin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.length === 0 ? (
        <div className="col-span-full py-16 text-center">
          <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 text-lg">No resources found</p>
        </div>
      ) : (
        resources.map((r) => (
          <div
            key={r.id}
            className="group bg-blue-50 hover:bg-white border border-blue-100 hover:border-blue-200 
                       rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 
                       flex flex-col"
          >
            {/* Card Header */}
            <div className="p-6 pb-4 border-b border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 leading-tight">
                    {r.name}
                  </h3>
                  <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {r.location}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-3.5 py-1 text-xs font-semibold rounded-2xl whitespace-nowrap ${
                    r.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.status === "ACTIVE" ? "Active" : "Out of Service"}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Package className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-medium">TYPE</p>
                  <p className="font-medium text-zinc-800">{r.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Users className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-medium">CAPACITY</p>
                  <p className="font-medium text-zinc-800">{r.capacity} people</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Calendar className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-medium">AVAILABILITY</p>
                  <p className="font-medium text-zinc-800">{r.availability}</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="border-t border-blue-100 bg-white px-6 py-4 flex gap-3">
                <button
                  onClick={() => onEdit(r)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-300 text-amber-700 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  onClick={() => onDelete(r.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-700 py-2.5 rounded-2xl text-sm font-medium transition-colors"
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

export default ResourceList;