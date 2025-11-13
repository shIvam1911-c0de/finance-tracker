import { AdminPanel } from '../components/Admin/AdminPanel';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
    const { isAdmin } = useAuth();

    if (!isAdmin()) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600 mt-2">Admin access required</p>
            </div>
        );
    }

    return <AdminPanel />;
};

export default AdminPage;