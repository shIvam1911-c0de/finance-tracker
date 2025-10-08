import { useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import {
    PieChart, Pie, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
    const { user } = useAuth();
    const { 
        analytics, 
        dashboardStats, 
        loading, 
        categoryChartData, 
        monthlyTrendData,
        yearlyOverviewData 
    } = useAnalytics();

    const statsCards = useMemo(() => {
        if (!dashboardStats) return [];

        const currentIncome = parseFloat(dashboardStats.currentMonth.income) || 0;
        const currentExpense = parseFloat(dashboardStats.currentMonth.expense) || 0;
        const balance = currentIncome - currentExpense;

        return [
            {
                title: 'Current Month Income',
                value: `$${currentIncome.toFixed(2)}`,
                color: 'bg-green-500',
                icon: '💰'
            },
            {
                title: 'Current Month Expense',
                value: `$${currentExpense.toFixed(2)}`,
                color: 'bg-red-500',
                icon: '💸'
            },
            {
                title: 'Balance',
                value: `$${balance.toFixed(2)}`,
                color: balance >= 0 ? 'bg-blue-500' : 'bg-orange-500',
                icon: '💵'
            },
            {
                title: 'Savings Rate',
                value: `${dashboardStats.savingsRate}%`,
                color: 'bg-purple-500',
                icon: '📊'
            }
        ];
    }, [dashboardStats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-xl text-gray-600 dark:text-gray-400">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Here's your financial overview
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.color} text-white text-3xl p-3 rounded-full`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Expense by Category
                    </h3>
                    {categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No expense data available
                        </div>
                    )}
                </div>

                {/* Monthly Trends Line Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Monthly Income vs Expense
                    </h3>
                    {monthlyTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No monthly data available
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Yearly Overview Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Yearly Overview
                    </h3>
                    {yearlyOverviewData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={yearlyOverviewData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="income" fill="#10b981" />
                                <Bar dataKey="expense" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No yearly data available
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            {dashboardStats?.recentTransactions && dashboardStats.recentTransactions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Transactions
                    </h3>
                    <div className="space-y-3">
                        {dashboardStats.recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {transaction.category}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {transaction.description || 'No description'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className={`text-lg font-bold ${
                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {transaction.type === 'income' ? '+' : '-'}$
                                    {parseFloat(transaction.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total Summary */}
            {analytics?.totals && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
                    <h3 className="text-2xl font-bold mb-4">Overall Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Income</p>
                            <p className="text-3xl font-bold">
                                ${parseFloat(analytics.totals.total_income || 0).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Expense</p>
                            <p className="text-3xl font-bold">
                                ${parseFloat(analytics.totals.total_expense || 0).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Net Balance</p>
                            <p className="text-3xl font-bold">
                                ${(analytics.balance || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;