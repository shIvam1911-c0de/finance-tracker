import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (hasRole('admin')) {
      fetchUsers();
    }
  }, [hasRole]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const deleteUser = async (userId, username) => {
    if (window.confirm(`Delete user "${username}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  if (!hasRole('admin')) {
    return <div className="text-red-500">Access Denied: Admin Only</div>;
  }

  if (loading) return <div className={isDark ? 'text-white' : 'text-gray-900'}>Loading users...</div>;

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
      
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <table className="w-full">
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>ID</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Username</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Role</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-600' : 'divide-gray-200'}`}>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.id}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.username}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'user' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className={`border rounded px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="read-only">Read Only</option>
                    </select>
                    <button
                      onClick={() => deleteUser(user.id, user.username)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        isDark 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};