import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { canModify } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    currency: 'USD',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const fetchBudgets = useCallback(async () => {
    try {
      const budgetsRes = await api.get('/budgets');
      setBudgets(budgetsRes.data);
      
      // Try to fetch alerts, but don't fail if endpoint doesn't exist
      try {
        const alertsRes = await api.get('/budgets/alerts');
        setAlerts(alertsRes.data);
      } catch (alertError) {
        console.warn('Budget alerts not available:', alertError.message);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', formData);
      setShowForm(false);
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        currency: 'USD',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      fetchBudgets();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await api.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  if (loading) return <div>Loading budgets...</div>;

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Budget Management</h1>
        {canModify() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Budget
          </button>
        )}
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className={`mb-6 ${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>Budget Alerts</h3>
          {alerts.map((alert, index) => (
            <div key={index} className={isDark ? 'text-orange-200' : 'text-orange-700'}>
              {alert.category}: {Number(alert.usage_percentage || 0).toFixed(1)}% used 
              (${alert.spent} / ${alert.budget_amount})
            </div>
          ))}
        </div>
      )}

      {/* Budget List */}
      <div className="grid gap-4">
        {budgets.map((budget) => (
          <div key={budget.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{budget.category}</h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{budget.period} • {budget.currency}</p>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: ${budget.spent || 0}</span>
                    <span>Budget: ${budget.amount}</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 mt-1`}>
                    <div 
                      className={`h-2 rounded-full ${
                        Number(budget.usage_percentage || 0) > 100 ? 'bg-red-500' :
                        Number(budget.usage_percentage || 0) > 80 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(Number(budget.usage_percentage || 0), 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Number(budget.usage_percentage || 0).toFixed(1)}% used
                  </p>
                </div>
              </div>
              
              {canModify() && (
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Budget</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};