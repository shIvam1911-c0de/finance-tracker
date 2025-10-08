import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { formatCurrency, getCurrencySymbol } from '../Common/CurrencySelector';
import { CategoryPieChart } from '../Charts/PieChart';
import { TrendLineChart } from '../Charts/LineChart';

export const MultiCurrencyDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, analyticsRes] = await Promise.all([
        api.get('/accounts/summary'),
        api.get('/analytics')
      ]);
      setAccounts(accountsRes.data);
      setAnalytics(analyticsRes.data);
      
      if (accountsRes.data.length > 0) {
        setSelectedCurrency(accountsRes.data[0].currency);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currencyData = useMemo(() => {
    return accounts.find(acc => acc.currency === selectedCurrency) || {};
  }, [accounts, selectedCurrency]);

  const availableCurrencies = useMemo(() => {
    return [...new Set(accounts.map(acc => acc.currency))];
  }, [accounts]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Multi-Currency Dashboard</h1>
        
        {availableCurrencies.length > 1 && (
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {availableCurrencies.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Currency Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Balance</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(currencyData.total_balance || 0, selectedCurrency)}
          </p>
          <p className="text-sm text-gray-500">{currencyData.account_count || 0} accounts</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Bank Accounts</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(currencyData.bank_balance || 0, selectedCurrency)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Credit Cards</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(currencyData.credit_balance || 0, selectedCurrency)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Investments</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(currencyData.investment_balance || 0, selectedCurrency)}
          </p>
        </div>
      </div>

      {/* All Currencies Overview */}
      {accounts.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">All Currencies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.currency} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{account.currency}</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(account.total_balance, account.currency)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {account.account_count} account{account.account_count !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Category Breakdown ({selectedCurrency})
          </h3>
          <CategoryPieChart data={analytics?.categoryBreakdown} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Monthly Trends ({selectedCurrency})
          </h3>
          <TrendLineChart data={analytics?.monthlyTrends} />
        </div>
      </div>

      {/* Currency Exchange Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Multi-Currency Features</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Each account can have its own currency</li>
          <li>• Transactions are recorded in account's currency</li>
          <li>• Reports can be filtered by currency</li>
          <li>• Budgets and goals support multiple currencies</li>
        </ul>
      </div>
    </div>
  );
};