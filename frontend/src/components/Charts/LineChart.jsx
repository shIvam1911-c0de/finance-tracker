import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export const TrendLineChart = ({ data }) => {
  const chartData = useMemo(() => 
    data?.map(item => ({
      month: item.month,
      income: parseFloat(item.income || 0),
      expense: parseFloat(item.expense || 0)
    })) || []
  , [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, '']} />
        <Legend />
        <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};