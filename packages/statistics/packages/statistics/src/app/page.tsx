'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import DataUpload from './components/DataUpload';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import PriceVisualization from './components/PriceVisualization';
import PricePrediction from './components/PricePrediction';

export interface MarketData {
  date: string;
  admin1: string;
  admin2: string;
  market: string;
  market_id: string;
  latitude: string;
  longitude: string;
  category: string;
  commodity: string;
  commodity_id: string;
  unit: string;
  priceflag: string;
  pricetype: string;
  currency: string;
  price: string;
  usdprice: string;
}

export default function Home() {
  const [data, setData] = useState<MarketData[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('');

  const handleDataUpload = (csvText: string) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as MarketData[];
        // Skip the second header row if it exists
        const filteredData = parsedData.filter(row => 
          row.date && !row.date.startsWith('#')
        );
        setData(filteredData);
        
        // Set default selections
        if (filteredData.length > 0) {
          const commodities = [...new Set(filteredData.map(d => d.commodity))];
          const markets = [...new Set(filteredData.map(d => d.market))];
          setSelectedCommodity(commodities[0] || '');
          setSelectedMarket(markets[0] || '');
        }
      }
    });
  };

  const commodities = [...new Set(data.map(d => d.commodity))].sort();
  const markets = [...new Set(data.map(d => d.market))].sort();

  const filteredData = data.filter(d => 
    (!selectedCommodity || d.commodity === selectedCommodity) &&
    (!selectedMarket || d.market === selectedMarket)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Market Price Statistical Analysis
          </h1>
          <p className="text-slate-300 text-lg">
            Analyze local market price trends and predict future movements
          </p>
        </header>

        {data.length === 0 ? (
          <DataUpload onUpload={handleDataUpload} />
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Commodity</label>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Commodities</option>
                    {commodities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Market</label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Markets</option>
                    {markets.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setData([])}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Clear Data & Upload New
              </button>
            </div>

            {/* Statistical Analysis */}
            <StatisticalAnalysis data={filteredData} />

            {/* Price Visualization */}
            <PriceVisualization data={filteredData} />

            {/* Price Prediction */}
            <PricePrediction data={filteredData} />
          </div>
        )}
      </div>
    </div>
  );
}

