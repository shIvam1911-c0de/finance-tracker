import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { CurrencySelector, formatCurrency } from '../Common/CurrencySelector';
import { useAuth } from '../../contexts/AuthContext';

export const MultiCurrencyTransactionForm = ({ onSuccess, onCancel, editTransaction = null }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { canModify } = useAuth();

  const [formData, setFormData] = useState({
    account_id: '',
    type: 'expense',
    category: '',
    amount: '',
    currency: 'USD',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAccounts();
    if (editTransaction) {
      setFormData({
        account_id: editTransaction.account_id || '',
        type: editTransaction.type,
        category: editTransaction.category,
        amount: editTransaction.amount,
        currency: editTransaction.currency || 'USD',
        description: editTransaction.description || '',
        date: editTransaction.date
      });
    }
  }, [editTransaction]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
      if (response.data.length > 0 && !formData.account_id) {
        setFormData(prev => ({ ...prev, account_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canModify()) return;

    setLoading(true);
    try {
      if (editTransaction) {
        await api.put(`/transactions/${editTransaction.id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = useCallback((accountId) => {
    const account = accounts.find(a => a.id === parseInt(accountId));
    setFormData(prev => ({
      ...prev,
      account_id: accountId,
      currency: account?.currency || 'USD'
    }));
  }, [accounts]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <select
              value={formData.account_id}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Food, Transport, Salary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full border rounded px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows="2"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading || !canModify()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editTransaction ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>

        {formData.amount && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Preview: {formatCurrency(formData.amount, formData.currency)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};