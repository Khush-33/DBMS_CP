import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const BudgetChart = ({ budgetRemaining, totalSpent }) => {
  const data = [
    { name: 'Spent', value: totalSpent, color: '#EF4444' },
    { name: 'Remaining', value: budgetRemaining, color: '#10B981' },
  ];

  const formatCurrency = (value) => `₹${(value / 10000000).toFixed(1)} Cr`;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={formatCurrency} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetChart;
