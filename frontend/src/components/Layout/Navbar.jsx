import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const Navbar = () => {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/accounts', label: 'Accounts', icon: '💳' },
        { to: '/transactions', label: 'Transactions', icon: '💸' },
        { to: '/budgets', label: 'Budgets', icon: '💰' },
        { to: '/goals', label: 'Goals', icon: '🎯' },
        { to: '/recurring', label: 'Recurring', icon: '🔄' },
        { to: '/reports', label: 'Reports', icon: '📈' },
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0">
                        <Link to="/dashboard" className="flex items-center">
                            <img src="/logo.png" alt="Finance Tracker" className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                <span className="hidden sm:inline">FinanceTracker</span>
                                <span className="sm:hidden">FT</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center flex-1 justify-center">
                        <div className="flex items-center space-x-1 xl:space-x-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="nav-link-desktop"
                                >
                                    <span className="xl:inline">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            {hasRole('admin') && (
                                <Link to="/admin" className="nav-link-admin-desktop">
                                    <span className="xl:inline">👨</span>
                                    <span>Admin</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side - User info */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-auto">
                        {/* User info - hidden on mobile */}
                        <div className="hidden sm:flex items-center space-x-1 lg:space-x-2">
                            <div className="text-right">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-12 lg:max-w-16">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-2 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                            >
                                <span className="sm:hidden">Exit</span>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-nav-link"
                                >
                                    {link.icon} {link.label}
                                </Link>
                            ))}
                            {hasRole('admin') && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-nav-link-admin"
                                >
                                    👨💼 Admin
                                </Link>
                            )}
                        </div>
                        
                        {/* Mobile user info and logout */}
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user?.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.role}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;