import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { CurrencySelector, formatCurrency } from '../Common/CurrencySelector';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

export const RecurringManager = () => {
  const [recurring, setRecurring] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { canModify } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    account_id: '',
    type: 'expense',
    category: '',
    amount: '',
    currency: 'USD',
    description: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const fetchData = useCallback(async () => {
    try {
      // Try to fetch accounts first
      try {
        const accountsRes = await api.get('/accounts');
        setAccounts(accountsRes.data);
      } catch (accountError) {
        console.warn('Accounts not available:', accountError.message);
        setAccounts([]);
      }
      
      // Try to fetch recurring transactions
      try {
        const recurringRes = await api.get('/recurring');
        setRecurring(recurringRes.data);
      } catch (recurringError) {
        console.warn('Recurring transactions not available:', recurringError.message);
        setRecurring([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setRecurring([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recurring', formData);
      setShowForm(false);
      setFormData({
        account_id: '',
        type: 'expense',
        category: '',
        amount: '',
        currency: 'USD',
        description: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create recurring transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this recurring transaction?')) {
      try {
        await api.delete(`/recurring/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete recurring transaction:', error);
      }
    }
  };

  const getFrequencyLabel = (freq) => {
    return FREQUENCIES.find(f => f.value === freq)?.label || freq;
  };

  if (loading) return <div className={isDark ? 'text-white' : 'text-gray-900'}>Loading recurring transactions...</div>;

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>🔄 Recurring Transactions</h1>
        {canModify() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Add Recurring
          </button>
        )}
      </div>

      {/* Recurring Transactions List */}
      <div className="grid gap-4">
        {recurring.map((item) => (
          <div key={item.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.type === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.type}
                  </span>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.category}</h3>
                </div>
                
                <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Amount:</span>
                    <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(item.amount, item.currency)}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Frequency:</span>
                    <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getFrequencyLabel(item.frequency)}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Account:</span>
                    <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.account_name}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Next:</span>
                    <span className={`ml-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(item.next_execution).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {canModify() && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {recurring.length === 0 && (
        <div className="text-center py-12">
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recurring transactions</p>
          <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Set up automatic income or expenses</p>
        </div>
      )}

      {/* Add Recurring Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Recurring Transaction</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account</label>
                <select
                  value={formData.account_id}
                  onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Salary, Rent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
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
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                  <CurrencySelector
                    value={formData.currency}
                    onChange={(currency) => setFormData({...formData, currency})}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {FREQUENCIES.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  rows="2"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded"
                >
                  Create Recurring
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