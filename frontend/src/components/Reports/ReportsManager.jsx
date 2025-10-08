import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { CurrencySelector, formatCurrency } from '../Common/CurrencySelector';
import { useTheme } from '../../contexts/ThemeContext';

export const ReportsManager = () => {
  const { isDark } = useTheme();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('financial');

  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    year: new Date().getFullYear()
  });

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let params = {};

      switch (reportType) {
        case 'financial':
          endpoint = '/reports/financial';
          params = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            currency: filters.currency
          };
          break;
        case 'tax':
          endpoint = '/reports/tax';
          params = {
            year: filters.year,
            currency: filters.currency
          };
          break;
        case 'budget':
          endpoint = '/reports/budget';
          break;
        default:
          return;
      }

      const response = await api.get(endpoint, { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, filters]);

  const downloadCSV = async () => {
    try {
      const response = await api.get('/reports/financial', {
        params: {
          ...filters,
          format: 'csv'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${filters.startDate}-${filters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Advanced Reports</h1>

      {/* Report Controls */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="financial">Financial Report</option>
              <option value="tax">Tax Report</option>
              <option value="budget">Budget Report</option>
            </select>
          </div>

          {reportType === 'financial' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </>
          )}

          {reportType === 'tax' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                className={`w-full border rounded px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                min="2020"
                max={new Date().getFullYear()}
              />
            </div>
          )}

          {(reportType === 'financial' || reportType === 'tax') && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
              <CurrencySelector
                value={filters.currency}
                onChange={(currency) => setFilters({...filters, currency})}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          
          {reportType === 'financial' && reportData && (
            <button
              onClick={downloadCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Financial Report */}
          {reportType === 'financial' && (
            <>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.summary.totalIncome, filters.currency)}
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary.totalExpenses, filters.currency)}
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Total Expenses</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      reportData.summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(reportData.summary.netIncome, filters.currency)}
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Net Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.summary.transactionCount}
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Transactions</p>
                  </div>
                </div>
              </div>

              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Category Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                        <th className={`text-left py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                        <th className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                        <th className={`text-right py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.categoryBreakdown.map((item, index) => (
                        <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.category}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.type === 'income' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className={`text-right py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(item.total, filters.currency)}
                          </td>
                          <td className={`text-right py-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Tax Report */}
          {reportType === 'tax' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Tax Report - {reportData.year}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.summary.total_income, filters.currency)}
                  </p>
                  <p className="text-gray-600">Total Income</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.summary.total_expenses, filters.currency)}
                  </p>
                  <p className="text-gray-600">Total Expenses</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Income</th>
                      <th className="text-right py-2">Expenses</th>
                      <th className="text-right py-2">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categories.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.category}</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.income, filters.currency)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(item.expenses, filters.currency)}
                        </td>
                        <td className="text-right py-2">{item.transaction_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Budget Report */}
          {reportType === 'budget' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Budget Performance</h3>
              <div className="space-y-4">
                {reportData.budgets.map((budget, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{budget.category}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        budget.status === 'Over Budget' ? 'bg-red-100 text-red-800' :
                        budget.status === 'Near Limit' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {budget.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(budget.budget_amount, budget.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Spent:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(budget.actual_spent, budget.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usage:</span>
                        <span className="ml-2 font-medium">
                          {budget.usage_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          budget.usage_percentage > 100 ? 'bg-red-500' :
                          budget.usage_percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.usage_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};