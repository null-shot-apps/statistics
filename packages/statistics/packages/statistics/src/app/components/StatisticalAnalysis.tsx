'use client';

import { MarketData } from '../page';

interface StatisticalAnalysisProps {
  data: MarketData[];
}

export default function StatisticalAnalysis({ data }: StatisticalAnalysisProps) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Statistical Analysis</h2>
        <p className="text-slate-400">No data available for analysis</p>
      </div>
    );
  }

  const prices = data.map(d => parseFloat(d.price)).filter(p => !isNaN(p));
  
  // Calculate statistics
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const median = sortedPrices.length % 2 === 0
    ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
    : sortedPrices[Math.floor(sortedPrices.length / 2)];
  
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  
  // Coefficient of variation (relative volatility)
  const cv = (stdDev / mean) * 100;
  
  // Calculate quartiles
  const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
  const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
  const iqr = q3 - q1;

  const stats = [
    { label: 'Mean Price', value: `₦${mean.toFixed(2)}`, description: 'Average price' },
    { label: 'Median Price', value: `₦${median.toFixed(2)}`, description: 'Middle value' },
    { label: 'Standard Deviation', value: `₦${stdDev.toFixed(2)}`, description: 'Price volatility' },
    { label: 'Variance', value: `${variance.toFixed(2)}`, description: 'Squared deviation' },
    { label: 'Coefficient of Variation', value: `${cv.toFixed(2)}%`, description: 'Relative volatility' },
    { label: 'Minimum Price', value: `₦${min.toFixed(2)}`, description: 'Lowest recorded' },
    { label: 'Maximum Price', value: `₦${max.toFixed(2)}`, description: 'Highest recorded' },
    { label: 'Price Range', value: `₦${range.toFixed(2)}`, description: 'Max - Min' },
    { label: 'Q1 (25th percentile)', value: `₦${q1.toFixed(2)}`, description: 'First quartile' },
    { label: 'Q3 (75th percentile)', value: `₦${q3.toFixed(2)}`, description: 'Third quartile' },
    { label: 'IQR', value: `₦${iqr.toFixed(2)}`, description: 'Interquartile range' },
    { label: 'Sample Size', value: `${prices.length}`, description: 'Number of records' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Statistical Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition-colors"
          >
            <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-300">Interpretation:</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• <strong>Volatility:</strong> {cv < 20 ? 'Low' : cv < 40 ? 'Moderate' : 'High'} price variation ({cv.toFixed(1)}%)</li>
          <li>• <strong>Price Spread:</strong> Prices range from ₦{min.toFixed(2)} to ₦{max.toFixed(2)}</li>
          <li>• <strong>Central Tendency:</strong> Most prices cluster around ₦{median.toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
}

