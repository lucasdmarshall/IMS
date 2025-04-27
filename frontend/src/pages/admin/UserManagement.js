import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Trash2, Edit, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open modal for creating/editing user
  const openModal = (user = null) => {
    if (user) {
      // Edit mode
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    } else {
      // Create mode
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setCurrentUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('staff');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Update user
        await userService.updateUser(currentUser._id, { name, email, role });
      } else {
        // Create user
        await userService.createUser({ name, email, password, role });
      }
      fetchUsers(); // Refresh user list
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        fetchUsers(); // Refresh user list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#1A2238] text-gray-100 mt-3">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => window.history.back()} 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200"
          >
            Back
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            User Management
          </h1>
          <button 
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center transform transition-transform duration-200 hover:scale-105 shadow-lg"
          >
            <Plus className="mr-2" /> Add User
          </button>
        </div>

        {/* User Table */}
        <div className="bg-[#1E293B]/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-700/30">
          <table className="w-full">
            <thead className="bg-[#1E293B]/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-gray-700/30 hover:bg-[#1E293B]/30 transition-colors duration-150">
                  <td className="px-6 py-4 text-gray-200">{user.name}</td>
                  <td className="px-6 py-4 text-gray-200">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                      user.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openModal(user)}
                      className="text-blue-400 hover:text-blue-300 mr-4 transform transition-transform hover:scale-110"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-400 hover:text-red-300 transform transition-transform hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Create/Edit User */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1E293B] rounded-xl p-8 w-full max-w-md border border-gray-700/30 shadow-2xl transform transition-all">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {currentUser ? 'Edit User' : 'Create User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1A2238] rounded-lg border border-gray-700/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1A2238] rounded-lg border border-gray-700/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-200"
                    required
                  />
                </div>
                {!currentUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1A2238] rounded-lg border border-gray-700/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-200"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1A2238] rounded-lg border border-gray-700/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-gray-200"
                  >
                    <option value="staff" className="bg-[#1A2238]">Staff</option>
                    <option value="manager" className="bg-[#1A2238]">Manager</option>
                    <option value="admin" className="bg-[#1A2238]">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700/30 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    {currentUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
