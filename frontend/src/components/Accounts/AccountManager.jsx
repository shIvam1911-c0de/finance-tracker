import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { CurrencySelector, formatCurrency } from '../Common/CurrencySelector';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'investment', label: 'Investment', icon: '📈' }
];

export const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { canModify } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    currency: 'USD',
    balance: '0'
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', formData);
      setShowForm(false);
      setFormData({ name: '', type: 'bank', currency: 'USD', balance: '0' });
      fetchAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this account? This action cannot be undone.')) {
      try {
        await api.delete(`/accounts/${id}`);
        fetchAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert(error.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  const getAccountIcon = (type) => {
    return ACCOUNT_TYPES.find(t => t.value === type)?.icon || '💼';
  };

  const getAccountLabel = (type) => {
    return ACCOUNT_TYPES.find(t => t.value === type)?.label || type;
  };

  if (loading) return <div className={isDark ? 'text-white' : 'text-gray-900'}>Loading accounts...</div>;

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Multi-Currency Accounts</h1>
        {canModify() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Account
          </button>
        )}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getAccountIcon(account.type)}</span>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{getAccountLabel(account.type)}</p>
                </div>
              </div>
              
              {canModify() && (
                <button
                  onClick={() => handleDelete(account.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Balance:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(account.balance, account.currency)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Currency:</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.currency}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  account.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {account.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Main Checking Account"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {ACCOUNT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                <CurrencySelector
                  value={formData.currency}
                  onChange={(currency) => setFormData({...formData, currency})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Initial Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                  Create Account
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