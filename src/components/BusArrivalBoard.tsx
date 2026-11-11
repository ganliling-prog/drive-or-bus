import React, { useState } from 'react';
import { BusArrivalInfo, CrowdLevel, BusType } from '../types/commute';
import { BUS_STOP_04121_DETAILS } from '../data/mockData';
import { Bus, Search, ArrowRight, UserCheck, Accessibility, Clock } from 'lucide-react';

interface BusArrivalBoardProps {
  busArrivals: BusArrivalInfo[];
  onSelectCarparkConnection?: (carparkName: string) => void;
}

export const BusArrivalBoard: React.FC<BusArrivalBoardProps> = ({
  busArrivals,
  onSelectCarparkConnection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConnectedOnly, setFilterConnectedOnly] = useState(false);

  const filteredBuses = busArrivals.filter((bus) => {
    const matchesSearch =
      bus.serviceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.originArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesConnected = !filterConnectedOnly || bus.connectsFromOuterCarparks.length > 0;
    return matchesSearch && matchesConnected;
  });

  const getLoadBadge = (load: CrowdLevel) => {
    switch (load) {
      case 'SEA':
        return (
          <span className="text-emerald-700 dark:text-emerald-300 font-medium text-xs">
            Seats Avail
          </span>
        );
      case 'SDA':
        return (
          <span className="text-amber-700 dark:text-amber-300 font-medium text-xs">
            Standing Avail
          </span>
        );
      case 'LSD':
        return (
          <span className="text-red-700 dark:text-red-300 font-medium text-xs">
            Limited Standing
          </span>
        );
    }
  };

  const getBusTypeLabel = (type: BusType) => {
    switch (type) {
      case 'DD':
        return 'Double Deck';
      case 'BD':
        return 'Bendy';
      case 'SD':
      default:
        return 'Single Deck';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      {/* Bus Stop 04121 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
              BUS STOP #{BUS_STOP_04121_DETAILS.code}
            </span>
            <span>{BUS_STOP_04121_DETAILS.roadName}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {BUS_STOP_04121_DETAILS.description}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Direct campus entrance: Li Ka Shing Library</span>
            <span aria-hidden="true">·</span>
            <span>School of Accountancy &amp; Connexion</span>
          </div>
        </div>

        {/* Quick Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search service (e.g. 106, 190)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setFilterConnectedOnly(!filterConnectedOnly)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterConnectedOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Park &amp; Ride Feeders
          </button>
        </div>
      </div>

      {/* Explanation Banner for Commuter */}
      <div className="my-4 p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
        <Bus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Why this bus stop matters: </span>
          Bus stop 04121 sits directly in the SMU concourse courtyard. If you park at Plaza Singapura (Dhoby Ghaut), Waterloo Centre, or Albert Centre, taking these buses drops you immediately into class without walking through city heat or rain.
        </div>
      </div>

      {/* Arrivals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredBuses.map((bus) => (
          <div
            key={bus.serviceNo}
            className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-base rounded-md font-mono tabular-nums tracking-wide shadow-2xs">
                  {bus.serviceNo}
                </span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    To {bus.destination}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    From {bus.originArea}
                  </div>
                </div>
              </div>

              {/* Next arrival badge */}
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {bus.nextBus.estimatedArrivalMinutes === 0
                      ? 'Arr'
                      : `${bus.nextBus.estimatedArrivalMinutes} min`}
                  </span>
                </div>
                <div className="text-xs">
                  {getLoadBadge(bus.nextBus.load)}
                </div>
              </div>
            </div>

            {/* Subsequent Arrivals Strip */}
            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Next: {bus.nextBus2 ? `${bus.nextBus2.estimatedArrivalMinutes}m` : '-'}
                  {bus.nextBus3 && ` · ${bus.nextBus3.estimatedArrivalMinutes}m`}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Type:</span> {getBusTypeLabel(bus.nextBus.type)}
                </span>
                {bus.nextBus.feature === 'WAB' && (
                  <span title="Wheelchair Accessible Bus" className="text-blue-500">
                    <Accessibility className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            {/* Outer Carpark Connection Link */}
            {bus.connectsFromOuterCarparks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  Connects from: {bus.connectsFromOuterCarparks.join(', ')}
                </span>
                {onSelectCarparkConnection && (
                  <button
                    onClick={() => onSelectCarparkConnection(bus.connectsFromOuterCarparks[0])}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    View Carpark <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBuses.length === 0 && (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          No bus services match your current query "{searchQuery}".
        </div>
      )}
    </div>
  );
};
