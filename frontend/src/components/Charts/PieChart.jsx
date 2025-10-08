import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const CategoryPieChart = ({ data }) => {
  const chartData = useMemo(() => 
    data?.map((item, index) => ({
      name: item.category,
      value: parseFloat(item.expense || 0),
      color: COLORS[index % COLORS.length]
    })) || []
  , [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};