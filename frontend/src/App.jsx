import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Loading from './components/Common/Loading';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Lazy loaded components
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const TransactionList = lazy(() => import('./components/Transactions/TransactionList'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const RecurringPage = lazy(() => import('./pages/RecurringPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public routes */}
                            <Route
                                path="/login"
                                element={
                                    <Suspense fallback={<Loading />}>
                                        <Login />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <Suspense fallback={<Loading />}>
                                        <Register />
                                    </Suspense>
                                }
                            />

                            {/* Protected routes */}
                            <Route
                                path="/*"
                                element={
                                    <ProtectedRoute>
                                        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                                            <Navbar />
                                            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                                <Suspense fallback={<Loading />}>
                                                    <Routes>
                                                        <Route path="/dashboard" element={<Dashboard />} />
                                                        <Route path="/accounts" element={<AccountsPage />} />
                                                        <Route path="/transactions" element={<TransactionList />} />
                                                        <Route path="/budgets" element={<BudgetsPage />} />
                                                        <Route path="/goals" element={<GoalsPage />} />
                                                        <Route path="/recurring" element={<RecurringPage />} />
                                                        <Route path="/reports" element={<ReportsPage />} />
                                                        <Route path="/admin" element={<AdminPage />} />
                                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                                        <Route
                                                            path="*"
                                                            element={
                                                                <div className="text-center py-12">
                                                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                                                        404 - Page Not Found
                                                                    </h1>
                                                                    <p className="text-gray-600 dark:text-gray-400">
                                                                        The page you're looking for doesn't exist.
                                                                    </p>
                                                                </div>
                                                            }
                                                        />
                                                    </Routes>
                                                </Suspense>
                                            </main>
                                        </div>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;