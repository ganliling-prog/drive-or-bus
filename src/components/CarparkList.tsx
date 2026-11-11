import React, { useState } from 'react';
import { Carpark, ParkingZone } from '../types/commute';
import { Car, Zap, Navigation, ArrowUpRight, Bus, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  onSelectCarpark?: (carpark: Carpark) => void;
  selectedCarparkId?: string;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  onSelectCarpark,
  selectedCarparkId,
}) => {
  const [activeZone, setActiveZone] = useState<ParkingZone | 'all'>('all');
  const [sortBy, setSortBy] = useState<'lots' | 'distance' | 'price'>('lots');

  const filteredCarparks = carparks
    .filter((c) => activeZone === 'all' || c.zone === activeZone)
    .sort((a, b) => {
      if (sortBy === 'lots') return b.availableLots - a.availableLots;
      if (sortBy === 'distance') return a.distanceToSmuMeters - b.distanceToSmuMeters;
      if (sortBy === 'price') return a.hourlyRateNumeric - b.hourlyRateNumeric;
      return 0;
    });

  const getStatusColor = (status: Carpark['status']) => {
    switch (status) {
      case 'abundant':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'moderate':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'limited':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'full':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    }
  };

  const getStatusLabel = (status: Carpark['status']) => {
    switch (status) {
      case 'abundant':
        return 'Abundant Lots';
      case 'moderate':
        return 'Moderate Lots';
      case 'limited':
        return 'Filling Up Fast';
      case 'full':
        return 'Almost Full / Queuing';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Carpark Lot Availability
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time space monitoring for SMU campus core and outer park-and-ride facilities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveZone('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeZone === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Carparks
            </button>
            <button
              onClick={() => setActiveZone('campus_core')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeZone === 'campus_core'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Campus Core (&lt;350m)
            </button>
            <button
              onClick={() => setActiveZone('outer_park_and_ride')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeZone === 'outer_park_and_ride'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Outer Park &amp; Ride
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="lots">Most Available Lots</option>
              <option value="distance">Closest Walk to SMU</option>
              <option value="price">Lowest Hourly Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Carparks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        {filteredCarparks.map((carpark) => {
          const isCampus = carpark.zone === 'campus_core';
          const isSelected = selectedCarparkId === carpark.id;

          return (
            <div
              key={carpark.id}
              onClick={() => onSelectCarpark && onSelectCarpark(carpark)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getStatusColor(
                        carpark.status
                      )}`}
                    >
                      {getStatusLabel(carpark.status)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isCampus ? 'Campus Core' : 'Park & Ride Option'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {carpark.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {carpark.address}
                  </div>
                </div>

                {/* Available lots counter */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                      {carpark.availableLots}
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      / {carpark.totalLots}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Lots Available</div>
                </div>
              </div>

              {/* Capacity progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Occupancy</span>
                  <span className="font-mono tabular-nums">{carpark.occupancyPercent}% full</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      carpark.occupancyPercent >= 90
                        ? 'bg-rose-500'
                        : carpark.occupancyPercent >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${carpark.occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Key Specs Bar */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs mb-3">
                <div>
                  <span className="text-slate-500 block">SMU Proximity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {carpark.walkMinutesToSmu} min ({carpark.distanceToSmuMeters}m)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Day Parking Rate</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    ${carpark.hourlyRateNumeric.toFixed(2)}/hr
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Height Limit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {carpark.heightLimitMeters}m {carpark.hasEvCharging && '· EV'}
                  </span>
                </div>
              </div>

              {/* Outer Carpark Bus Connection Banner */}
              {!isCampus && carpark.recommendedBusToSmu && (
                <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <Bus className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Direct Bus to Stop 04121 (SMU): </span>
                    Take Bus <span className="font-mono font-bold">{carpark.recommendedBusToSmu.busNumber}</span> from {carpark.recommendedBusToSmu.boardingStop}.
                    Takes ~{carpark.recommendedBusToSmu.busTravelMinutes} mins directly to campus entrance!
                  </div>
                </div>
              )}

              {/* Campus Carpark Status Note */}
              {isCampus && (
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    {carpark.trend === 'filling_fast' ? (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" /> Fast turnover ({carpark.trendLotsDelta} lots / 15m)
                      </span>
                    ) : carpark.trend === 'emptying' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Lots opening up (+{carpark.trendLotsDelta})
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Minus className="w-3.5 h-3.5" /> Stable inflow
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500">
                    Evening flat rate: {carpark.weekdayRateOffPeak}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
