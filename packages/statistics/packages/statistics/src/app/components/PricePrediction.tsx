'use client';

import { MarketData } from '../page';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PricePredictionProps {
  data: MarketData[];
}

export default function PricePrediction({ data }: PricePredictionProps) {
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Price Prediction</h2>
        <p className="text-slate-400">No data available for prediction</p>
      </div>
    );
  }

  // Prepare time series data
  const timeSeriesData = data
    .map(d => ({
      date: new Date(d.date).getTime(),
      dateStr: d.date,
      price: parseFloat(d.price),
    }))
    .filter(d => !isNaN(d.price) && !isNaN(d.date))
    .sort((a, b) => a.date - b.date);

  if (timeSeriesData.length < 2) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Price Prediction</h2>
        <p className="text-slate-400">Insufficient data for prediction (need at least 2 data points)</p>
      </div>
    );
  }

  // Linear regression for prediction
  const n = timeSeriesData.length;
  const sumX = timeSeriesData.reduce((sum, d, i) => sum + i, 0);
  const sumY = timeSeriesData.reduce((sum, d) => sum + d.price, 0);
  const sumXY = timeSeriesData.reduce((sum, d, i) => sum + i * d.price, 0);
  const sumX2 = timeSeriesData.reduce((sum, d, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (goodness of fit)
  const meanY = sumY / n;
  const ssTotal = timeSeriesData.reduce((sum, d) => sum + Math.pow(d.price - meanY, 2), 0);
  const ssResidual = timeSeriesData.reduce((sum, d, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(d.price - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  // Generate predictions for next 5 periods
  const lastDate = new Date(timeSeriesData[timeSeriesData.length - 1].dateStr);
  const predictions = [];
  
  for (let i = 1; i <= 5; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setMonth(futureDate.getMonth() + i);
    
    const predictedPrice = slope * (n + i - 1) + intercept;
    
    // Calculate prediction interval (95% confidence)
    const residuals = timeSeriesData.map((d, idx) => {
      const predicted = slope * idx + intercept;
      return d.price - predicted;
    });
    const stdError = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2));
    const marginOfError = 1.96 * stdError; // 95% confidence interval
    
    predictions.push({
      dateStr: futureDate.toLocaleDateString(),
      predicted: predictedPrice,
      lower: predictedPrice - marginOfError,
      upper: predictedPrice + marginOfError,
      isPrediction: true,
    });
  }

  // Combine historical and predicted data
  const combinedData = [
    ...timeSeriesData.map(d => ({
      dateStr: d.dateStr,
      actual: d.price,
      predicted: null,
      lower: null,
      upper: null,
      isPrediction: false,
    })),
    ...predictions.map(p => ({
      dateStr: p.dateStr,
      actual: null,
      predicted: p.predicted,
      lower: p.lower,
      upper: p.upper,
      isPrediction: true,
    })),
  ];

  // Simple Moving Average prediction
  const windowSize = Math.min(7, timeSeriesData.length);
  const recentPrices = timeSeriesData.slice(-windowSize).map(d => d.price);
  const smaForecast = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

  // Exponential Smoothing (alpha = 0.3)
  const alpha = 0.3;
  let esValue = timeSeriesData[0].price;
  for (let i = 1; i < timeSeriesData.length; i++) {
    esValue = alpha * timeSeriesData[i].price + (1 - alpha) * esValue;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Price Prediction & Forecasting
      </h2>

      {/* Prediction Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
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
            dataKey="actual" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Historical Price"
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Predicted Price"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="upper" 
            stroke="#22d3ee" 
            strokeWidth={1}
            dot={false}
            name="Upper Bound (95% CI)"
            strokeDasharray="2 2"
          />
          <Line 
            type="monotone" 
            dataKey="lower" 
            stroke="#22d3ee" 
            strokeWidth={1}
            dot={false}
            name="Lower Bound (95% CI)"
            strokeDasharray="2 2"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Prediction Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Linear Regression Forecast</div>
          <div className="text-2xl font-bold text-cyan-400">₦{predictions[0].predicted.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Next period prediction</div>
          <div className="text-xs text-slate-400 mt-2">
            95% CI: ₦{predictions[0].lower.toFixed(2)} - ₦{predictions[0].upper.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Moving Average Forecast</div>
          <div className="text-2xl font-bold text-green-400">₦{smaForecast.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Based on last {windowSize} periods</div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-sm text-slate-400 mb-1">Exponential Smoothing</div>
          <div className="text-2xl font-bold text-purple-400">₦{esValue.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">α = {alpha} (weighted recent data)</div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
        <h3 className="font-semibold mb-3 text-cyan-300">Model Performance & Insights:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <strong>R² (Goodness of Fit):</strong> {rSquared.toFixed(4)}
            <br />
            <span className="text-xs text-slate-400">
              {rSquared > 0.7 ? '✅ Strong fit' : rSquared > 0.4 ? '⚠️ Moderate fit' : '❌ Weak fit'}
            </span>
          </div>
          <div>
            <strong>Trend Direction:</strong> {slope > 0 ? '📈 Increasing' : slope < 0 ? '📉 Decreasing' : '➡️ Stable'}
            <br />
            <span className="text-xs text-slate-400">
              {Math.abs(slope) > 1 ? 'Strong trend' : 'Weak trend'}
            </span>
          </div>
          <div>
            <strong>Price Change Rate:</strong> {slope > 0 ? '+' : ''}{slope.toFixed(2)} NGN/period
          </div>
          <div>
            <strong>Forecast Confidence:</strong> {rSquared > 0.7 ? 'High' : rSquared > 0.4 ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>

      {/* Next 5 Periods Predictions */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3 text-slate-300">Next 5 Periods Forecast:</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-2 text-left">Period</th>
                <th className="px-4 py-2 text-right">Predicted Price</th>
                <th className="px-4 py-2 text-right">Lower Bound</th>
                <th className="px-4 py-2 text-right">Upper Bound</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, idx) => (
                <tr key={idx} className="border-t border-slate-700">
                  <td className="px-4 py-2">{pred.dateStr}</td>
                  <td className="px-4 py-2 text-right font-semibold text-cyan-400">
                    ₦{pred.predicted.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400">
                    ₦{pred.lower.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400">
                    ₦{pred.upper.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

