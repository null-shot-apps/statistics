'use client';

import { MarketData } from '../page';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface PriceVisualizationProps {
  data: MarketData[];
}

export default function PriceVisualization({ data }: PriceVisualizationProps) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Price Visualization</h2>
        <p className="text-slate-400">No data available for visualization</p>
      </div>
    );
  }

  // Prepare time series data
  const timeSeriesData = data
    .map(d => ({
      date: new Date(d.date).getTime(),
      dateStr: d.date,
      price: parseFloat(d.price),
      usdPrice: parseFloat(d.usdprice),
    }))
    .filter(d => !isNaN(d.price) && !isNaN(d.date))
    .sort((a, b) => a.date - b.date);

  // Calculate moving average (7-period)
  const movingAvgData = timeSeriesData.map((point, index) => {
    const start = Math.max(0, index - 6);
    const subset = timeSeriesData.slice(start, index + 1);
    const avg = subset.reduce((sum, p) => sum + p.price, 0) / subset.length;
    return {
      ...point,
      movingAvg: avg,
    };
  });

  // Calculate linear regression for trend line
  const n = timeSeriesData.length;
  const sumX = timeSeriesData.reduce((sum, d, i) => sum + i, 0);
  const sumY = timeSeriesData.reduce((sum, d) => sum + d.price, 0);
  const sumXY = timeSeriesData.reduce((sum, d, i) => sum + i * d.price, 0);
  const sumX2 = timeSeriesData.reduce((sum, d, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const trendData = timeSeriesData.map((d, i) => ({
    ...d,
    trend: slope * i + intercept,
  }));

  // Price distribution for histogram
  const prices = data.map(d => parseFloat(d.price)).filter(p => !isNaN(p));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const binCount = 10;
  const binSize = (maxPrice - minPrice) / binCount;
  
  const histogram = Array.from({ length: binCount }, (_, i) => {
    const binStart = minPrice + i * binSize;
    const binEnd = binStart + binSize;
    const count = prices.filter(p => p >= binStart && p < binEnd).length;
    return {
      range: `${binStart.toFixed(0)}-${binEnd.toFixed(0)}`,
      count,
      binStart,
    };
  });

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Price Trends Over Time
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={movingAvgData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="dateStr" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Price (NGN)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Actual Price"
            />
            <Line 
              type="monotone" 
              dataKey="movingAvg" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              name="7-Period Moving Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Line Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Linear Regression Trend
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="dateStr" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Price (NGN)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={1}
              dot={{ r: 3 }}
              name="Actual Price"
            />
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="#a855f7" 
              strokeWidth={3}
              dot={false}
              name="Trend Line"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
          <h3 className="font-semibold mb-2 text-purple-300">Trend Analysis:</h3>
          <p className="text-sm text-slate-300">
            <strong>Slope:</strong> {slope > 0 ? '+' : ''}{slope.toFixed(4)} NGN per period
            <br />
            <strong>Direction:</strong> {slope > 0 ? '📈 Upward trend (prices increasing)' : slope < 0 ? '📉 Downward trend (prices decreasing)' : '➡️ Stable (no significant trend)'}
          </p>
        </div>
      </div>

      {/* Price Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Price Distribution (Histogram)
        </h2>
        
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              type="number"
              dataKey="binStart" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Price Range (NGN)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
            />
            <YAxis 
              type="number"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'count') return [value, 'Frequency'];
                return [value, name];
              }}
            />
            <Scatter 
              data={histogram} 
              fill="#eab308"
              shape="square"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

