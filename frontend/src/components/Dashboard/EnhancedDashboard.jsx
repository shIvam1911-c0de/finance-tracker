import { useMemo } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { CategoryPieChart } from '../Charts/PieChart';
import { TrendLineChart } from '../Charts/LineChart';
import { IncomeExpenseBarChart } from '../Charts/BarChart';
import { LazyWrapper } from '../Common/LazyWrapper';

export const EnhancedDashboard = () => {
  const { analytics, dashboardStats, loading } = useAnalytics();

  const totalBalance = useMemo(() => {
    if (!analytics?.totals) return 0;
    return parseFloat(analytics.totals.total_income || 0) - parseFloat(analytics.totals.total_expense || 0);
  }, [analytics?.totals]);

  if (loading) return <div>Loading...</div>;

  return (
    <LazyWrapper>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">Total Balance</h3>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalBalance.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">This Month Income</h3>
            <p className="text-2xl font-bold text-green-600">
              ${dashboardStats?.currentMonth?.income || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600">This Month Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              ${dashboardStats?.currentMonth?.expense || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
            <CategoryPieChart data={analytics?.categoryBreakdown} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
            <TrendLineChart data={analytics?.monthlyTrends} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Yearly Overview</h3>
          <IncomeExpenseBarChart data={analytics?.yearlyOverview} />
        </div>
      </div>
    </LazyWrapper>
  );
};