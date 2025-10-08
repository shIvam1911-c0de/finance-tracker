import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export const IncomeExpenseBarChart = ({ data }) => {
  const chartData = useMemo(() => 
    data?.map(item => ({
      year: item.year?.toString() || item.month,
      income: parseFloat(item.income || 0),
      expense: parseFloat(item.expense || 0)
    })) || []
  , [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, '']} />
        <Legend />
        <Bar dataKey="income" fill="#00C49F" />
        <Bar dataKey="expense" fill="#FF8042" />
      </BarChart>
    </ResponsiveContainer>
  );
};