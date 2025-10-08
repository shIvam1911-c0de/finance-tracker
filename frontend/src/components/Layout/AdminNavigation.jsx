import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const AdminNavigation = () => {
  const { hasRole, user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
            Dashboard
          </Link>
          <Link to="/transactions" className="hover:bg-blue-700 px-3 py-2 rounded">
            Transactions
          </Link>
          <Link to="/analytics" className="hover:bg-blue-700 px-3 py-2 rounded">
            Analytics
          </Link>
          {hasRole('admin') && (
            <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded bg-red-500">
              Admin Panel
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user?.username} ({user?.role})
          </span>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};