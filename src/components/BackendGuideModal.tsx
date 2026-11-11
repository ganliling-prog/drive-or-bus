import React, { useState } from 'react';
import { X, Check, Copy, Terminal, ExternalLink, Globe } from 'lucide-react';

interface BackendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  customBackendUrl: string;
  setCustomBackendUrl: (url: string) => void;
  isUsingCustomBackend: boolean;
  setIsUsingCustomBackend: (active: boolean) => void;
}

export const BackendGuideModal: React.FC<BackendGuideModalProps> = ({
  isOpen,
  onClose,
  customBackendUrl,
  setCustomBackendUrl,
  isUsingCustomBackend,
  setIsUsingCustomBackend,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sampleExpressCode = `// server.ts (Express proxy to LTA DataMall v2)
import express from 'express';
import axios from 'axios';

const app = express();
const LTA_API_KEY = process.env.LTA_DATAMALL_KEY;

// 1. Bus Stop 04121 Live Arrivals
app.get('/api/bus/04121', async (req, res) => {
  try {
    const response = await axios.get(
      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121',
      { headers: { AccountKey: LTA_API_KEY } }
    );
    res.json(response.data.Services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch LTA bus arrivals' });
  }
});

// 2. Real-time Carpark Availability (Filtered to SMU precinct)
app.get('/api/carparks', async (req, res) => {
  try {
    const response = await axios.get(
      'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      { headers: { AccountKey: LTA_API_KEY } }
    );
    // Filter by CarParkID or lat/lng within 1.5km of SMU (1.2963, 103.8502)
    res.json(response.data.value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch carpark lots' });
  }
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Backend Connection Specifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready-to-use API endpoints &amp; LTA DataMall proxy contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Backend Switcher */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" />
              Connect Your Backend URL
            </span>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <span className="text-slate-600 dark:text-slate-400">Enable Custom API:</span>
              <input
                type="checkbox"
                checked={isUsingCustomBackend}
                onChange={(e) => setIsUsingCustomBackend(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </label>
          </div>
          <input
            type="text"
            value={customBackendUrl}
            onChange={(e) => setCustomBackendUrl(e.target.value)}
            placeholder="e.g. http://localhost:3000/api or https://my-backend.com/api"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            When enabled, the frontend will query your backend for `/api/carparks` and `/api/bus/04121`. When disabled, it uses realistic simulated data with dynamic fluctuations.
          </p>
        </div>

        {/* LTA Official DataMall Reference */}
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
              Singapore LTA DataMall Endpoints:
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-[11px] flex items-center justify-between">
                <span>GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121',
                      1
                    )
                  }
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer ml-2"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-[11px] flex items-center justify-between">
                <span>GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
                      2
                    )
                  }
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer ml-2"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Existing Serverless Files in /api */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs mb-1">
              Active Serverless Functions in <code className="font-mono">/api</code>:
            </h4>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">/api/health.ts</span>
                <span>— Service status &amp; checks if AccountKey is set</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">/api/carparkavailability.ts</span>
                <span>— Fetches live HDB, LTA, and URA carpark lots</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">/api/busarrival.ts</span>
                <span>— Fetches live next buses for Stop 04121 (v3)</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                How to provide your LTA DataMall Key:
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              Set <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-semibold">LTA_DATAMALL_KEY="your-32-char-key"</code> in your environment (<code className="font-mono">.env</code> or hosting environment variables). The endpoints will automatically forward it as the <code className="font-mono font-semibold">AccountKey</code> header.
            </p>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
# In .env:
LTA_DATAMALL_KEY="YOUR_LTA_DATAMALL_ACCOUNT_KEY"

# Or run locally:
LTA_DATAMALL_KEY="your-key" npm run dev
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
