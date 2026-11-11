import React from 'react';
import { RefreshCw, Code, Car, Bus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'all' | 'decision' | 'carparks' | 'bus' | 'map' | 'cost';
  setActiveTab: (tab: 'all' | 'decision' | 'carparks' | 'bus' | 'map' | 'cost') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenBackendGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenBackendGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <span className="flex items-center">
                <Car className="w-4 h-4 -mr-1" />
                <Bus className="w-3.5 h-3.5" />
              </span>
            </div>
            <a
              href="#decision"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('all');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
            >
              SMU Commute Advisor
            </a>
          </div>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('all')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('carparks')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'carparks'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Carparks
            </button>
            <button
              onClick={() => setActiveTab('bus')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'bus'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bus Stop 04121
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'map'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Campus Map
            </button>
            <button
              onClick={() => setActiveTab('cost')}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === 'cost'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cost &amp; Time
            </button>
          </nav>

          {/* Zone 3: 1 primary action (with secondary refresh affordance) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh simulated live LTA data"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              onClick={onOpenBackendGuide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Backend Spec</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
