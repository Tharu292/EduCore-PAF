import React, { useState, useEffect } from 'react';
import { Search, Users, ShieldCheck, User, TrendingUp } from 'lucide-react';
import API from "../api/axios"; 
import useAuthToken from "../hooks/useAuthToken";

export default function AdminPanel() {
  
  useAuthToken();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    API.get("/admin/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  
  const handleRoleChange = (userId, newRole) => {
    API.put(`/admin/role/${userId}`, [newRole])
      .then(() => {
       
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, roles: [newRole] } : u))
        );
        alert("Role updated successfully!");
      })
      .catch((err) => {
        console.error("Role update failed:", err);
        alert("Failed to update role.");
      });
  };

  
  const totalUsers = users.length;
  const admins = users.filter((u) => u.roles?.includes("ADMIN")).length;
  const standardUsers = totalUsers - admins;

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading Admin Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center text-blue-600 mb-2">
          <ShieldCheck className="w-5 h-5 mr-2" />
          <span className="text-sm font-semibold tracking-wider uppercase">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User & system management</h1>
        <p className="text-gray-500">Manage user accounts, assign roles, and monitor recent system activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Total users</p>
          <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Admins</p>
          <p className="text-3xl font-bold text-gray-900">{admins}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <User className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Standard users</p>
          <p className="text-3xl font-bold text-gray-900">{standardUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 mb-1">System Status</p>
          <p className="text-xl font-bold text-green-600 mt-2">Online</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Manage Users Table (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage users</h2>
              <p className="text-sm text-gray-500">Assign or revoke admin privileges</p>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const currentRole = user.roles?.includes("ADMIN") ? "ADMIN" : "USER";
                  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3 shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{user.name || "Unknown User"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {currentRole === 'ADMIN' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                            <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            USER
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select 
                          value={currentRole}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 cursor-pointer"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Feed (Takes up 1 column) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">System Information</h2>
          </div>
          
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
              <p className="text-sm text-gray-800">
                <span className="font-semibold text-gray-900">Database connected</span> successfully.
              </p>
            </div>
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
              <p className="text-sm text-gray-800">
                <span className="font-semibold text-gray-900">Real-time sync</span> is active. Users are fetched directly from MongoDB.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}