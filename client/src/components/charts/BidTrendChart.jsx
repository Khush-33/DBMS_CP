import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BidTrendChart = ({ bids }) => {
  // Group bids by time (last 10 bids)
  const data = bids.slice(0, 10).reverse().map((bid, index) => ({
    index: index + 1,
    amount: bid.Bid_Amount / 10000000, // Convert to Cr
    player: bid.Player_Name,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="index" 
            stroke="#9CA3AF"
            label={{ value: 'Recent Bids', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            label={{ value: 'Amount (Cr)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value) => [`₹${value.toFixed(1)} Cr`, 'Amount']}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#FF6B35" 
            strokeWidth={2}
            dot={{ fill: '#FF6B35', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BidTrendChart;
