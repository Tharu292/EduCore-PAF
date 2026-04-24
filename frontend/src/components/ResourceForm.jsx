import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, X, Package, MapPin, Users, Clock, AlertCircle } from "lucide-react";

function ResourceForm({ onSubmit, selectedResource }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "",
    availability: ""   // We'll build this from startTime + endTime + days
  });

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const [errors, setErrors] = useState({});

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (selectedResource) {
      setForm(selectedResource);
      setErrors({});

      // Try to parse availability if it exists (format: "Mon-Fri 08:00-17:00")
      if (selectedResource.availability) {
        const match = selectedResource.availability.match(/(.+?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/);
        if (match) {
          const daysPart = match[1];
          setStartTime(match[2]);
          setEndTime(match[3]);

          const parsedDays = daysPart.split("-").flatMap(d => {
            if (d.includes(",")) return d.split(",").map(x => x.trim());
            return [d.trim()];
          });
          setSelectedDays(parsedDays.length > 0 ? parsedDays : ["Mon", "Tue", "Wed", "Thu", "Fri"]);
        }
      }
    } else {
      // Reset for new resource
      setForm({
        name: "",
        type: "",
        capacity: "",
        location: "",
        status: "",
        availability: ""
      });
      setStartTime("08:00");
      setEndTime("17:00");
      setSelectedDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setErrors({});
    }
  }, [selectedResource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const buildAvailabilityString = () => {
    if (selectedDays.length === 0) return "";
    const daysStr = selectedDays.length === 7
      ? "Daily"
      : selectedDays.length >= 5 && selectedDays.includes("Mon")
        ? "Mon-Fri"
        : selectedDays.join(", ");

    return `${daysStr} ${startTime}-${endTime}`;
  };
//Form validations
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Resource name is required";
    if (!form.type) newErrors.type = "Please select a type";
    if (!form.capacity || form.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.status) newErrors.status = "Please select a status";
    if (selectedDays.length === 0) newErrors.availability = "Please select at least one day";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const availabilityString = buildAvailabilityString();

    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      availability: availabilityString
    });
  };

  const handleCancel = () => {
    // Just close the modal - parent component will handle it
    // No need to reset here as parent controls the modal
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <Package className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-800">
          {selectedResource ? "Update Resource" : "Add New Resource"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Resource Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Physics Laboratory"
            value={form.name}
            onChange={handleChange}
            className={`w-full bg-white border ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-400'} rounded-2xl px-4 py-3.5 text-zinc-800 placeholder-zinc-400 focus:outline-none transition-colors`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`w-full bg-white border ${errors.type ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-400'} rounded-2xl px-4 py-3.5 text-zinc-700 focus:outline-none transition-colors appearance-none`}
          >
            <option value="">Select Type</option>
            <option value="LAB">Laboratory</option>
            <option value="ROOM">Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.type}</p>}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Capacity <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Users className="w-5 h-5" />
            </div>
            <input
              type="number"
              name="capacity"
              placeholder="50"
              value={form.capacity}
              onChange={handleChange}
              className={`w-full bg-white border ${errors.capacity ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-400'} rounded-2xl pl-11 pr-4 py-3.5 text-zinc-800 placeholder-zinc-400 focus:outline-none transition-colors`}
            />
          </div>
          {errors.capacity && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.capacity}</p>}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="location"
              placeholder="e.g. Science Block, Floor 2"
              value={form.location}
              onChange={handleChange}
              className={`w-full bg-white border ${errors.location ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-400'} rounded-2xl pl-11 pr-4 py-3.5 text-zinc-800 placeholder-zinc-400 focus:outline-none transition-colors`}
            />
          </div>
          {errors.location && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.location}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={`w-full bg-white border ${errors.status ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-zinc-400'} rounded-2xl px-4 py-3.5 text-zinc-700 focus:outline-none transition-colors appearance-none`}
          >
            <option value="">Select Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.status}</p>}
        </div>

        {/* Availability - Time Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Availability <span className="text-red-500">*</span>
          </label>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
            {/* Days Selection */}
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">DAYS</p>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 text-sm rounded-2xl transition-all ${selectedDays.includes(day)
                        ? "bg-zinc-900 text-white"
                        : "bg-white border border-zinc-200 hover:bg-zinc-100"
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.availability && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.availability}</p>}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> START TIME
                </p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> END TIME
                </p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="pt-2 text-sm text-zinc-600 bg-white p-3 rounded-xl border">
              Preview: <span className="font-medium">{buildAvailabilityString() || "No availability set"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* Action Button */}
      <div className="flex justify-center pt-6 border-t border-zinc-100">
        <button
          type="submit"
          className="w-56 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white font-medium py-3.5 rounded-2xl transition-colors"
        >
          <Save className="w-5 h-5" />
          {selectedResource ? "Update Resource" : "Add Resource"}
        </button>
      </div>
    </form>
  );
}

export default ResourceForm;