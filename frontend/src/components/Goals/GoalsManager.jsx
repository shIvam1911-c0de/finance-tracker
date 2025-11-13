import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { CurrencySelector, formatCurrency } from '../Common/CurrencySelector';
import { useAuth } from '../../contexts/AuthContext';
export const GoalsManager = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { canModify } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '0',
    currency: 'USD',
    target_date: '',
    category: ''
  });

  const fetchGoals = useCallback(async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        current_amount: '0',
        currency: 'USD',
        target_date: '',
        category: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const updateProgress = async (id, amount) => {
    try {
      await api.put(`/goals/${id}/progress`, { amount: parseFloat(amount) });
      fetchGoals();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  if (loading) return <div className="text-gray-900 dark:text-white">Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎯 Financial Goals</h1>
        {canModify() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Add Goal
          </button>
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                {goal.description && (
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{goal.description}</p>
                )}
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                  Category: {goal.category} • Target: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No deadline'}
                </p>
              </div>
              
              {goal.is_achieved && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Achieved
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Number(goal.progress_percentage || 0).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    goal.is_achieved ? 'bg-green-500' : 
                    Number(goal.progress_percentage || 0) > 75 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(Number(goal.progress_percentage || 0), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>{formatCurrency(goal.current_amount, goal.currency)}</span>
                <span>{formatCurrency(goal.target_amount, goal.currency)}</span>
              </div>
            </div>

            {canModify() && !goal.is_achieved && (
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Add amount"
                  className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateProgress(goal.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-2 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Financial Goal</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Goal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  rows="2"
                  placeholder="Optional description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <CurrencySelector
                    value={formData.currency}
                    onChange={(currency) => setFormData({...formData, currency})}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="e.g., Savings, Investment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
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