'use client';

import { useState } from 'react';

interface DataUploadProps {
  onUpload: (csvText: string) => void;
}

export default function DataUpload({ onUpload }: DataUploadProps) {
  const [csvText, setCsvText] = useState('');

  const handlePaste = () => {
    if (csvText.trim()) {
      onUpload(csvText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onUpload(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload Your Market Data</h2>
          <p className="text-slate-400">
            Upload a CSV file or paste your data to begin analysis
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block w-full">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-1">Click to upload CSV file</p>
              <p className="text-sm text-slate-400">or drag and drop</p>
            </div>
          </label>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-800 text-slate-400">OR</span>
          </div>
        </div>

        {/* Paste Data */}
        <div>
          <label className="block text-sm font-medium mb-2">Paste CSV Data</label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your CSV data here (including headers)..."
            className="w-full h-64 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handlePaste}
            disabled={!csvText.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Analyze Data
          </button>
        </div>

        {/* Sample Data Format */}
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm font-medium mb-2 text-slate-300">Expected CSV Format:</p>
          <pre className="text-xs text-slate-400 overflow-x-auto">
{`date,admin1,admin2,market,commodity,price,usdprice
1/15/2002,Katsina,Jibia,Jibia (CBM),Maize,175.92,1.54
1/15/2002,Katsina,Jibia,Jibia (CBM),Rice (imported),358.7,3.14`}
          </pre>
        </div>
      </div>
    </div>
  );
}

