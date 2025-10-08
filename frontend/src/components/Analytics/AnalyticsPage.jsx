import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import PieChart from '../Charts/PieChart';
import LineChart from '../Charts/LineChart';
import Loading from '../Common/Loading';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      const response = await api.get(`/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.${type === 'transactions' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) return <Loading />;

  const categoryData = analytics?.categoryBreakdown?.map(item => ({
    name: item.category,
    value: parseFloat(item.expense)
  })) || [];

  const trendData = analytics?.monthlyTrends?.map(item => ({
    month: item.month,
    income: parseFloat(item.income),
    expense: parseFloat(item.expense)
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              <button
                onClick={() => exportData('transactions')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export Transactions
              </button>
              <button
                onClick={() => exportData('analytics')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Export Analytics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${analytics?.totals?.total_income || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${analytics?.totals?.total_expense || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p className={`text-2xl font-bold ${analytics?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${analytics?.balance || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analytics?.totals?.total_transactions || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart 
          data={categoryData} 
          title="Expenses by Category" 
        />
        <LineChart 
          data={trendData} 
          title="Income vs Expenses Trend" 
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;