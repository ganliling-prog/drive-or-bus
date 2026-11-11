import React from 'react';
import { Carpark } from '../types/commute';
import { Car, Bus, ArrowRight, DollarSign, Clock, ShieldAlert, Check } from 'lucide-react';

interface CostComparisonMatrixProps {
  durationHours: number;
  setDurationHours: (hours: number) => void;
  bestCampusOption: Carpark;
  bestOuterOption: Carpark;
}

export const CostComparisonMatrix: React.FC<CostComparisonMatrixProps> = ({
  durationHours,
  setDurationHours,
  bestCampusOption,
  bestOuterOption,
}) => {
  // Calculations
  const campusRate = bestCampusOption.hourlyRateNumeric;
  const campusTotalParking = Number((campusRate * durationHours).toFixed(2));

  const outerRate = bestOuterOption.hourlyRateNumeric;
  const outerParkingFee = Number((outerRate * durationHours).toFixed(2));
  const busFareReturn = 2.18; // 2 x adult card fare $1.09
  const outerTotal = Number((outerParkingFee + busFareReturn).toFixed(2));

  const savings = Number((campusTotalParking - outerTotal).toFixed(2));
  const isParkRideCheaper = savings > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Direct Campus vs. Park &amp; Ride Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent financial and time tradeoff analysis based on your intended duration of stay
          </p>
        </div>

        {/* Duration Slider Control */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Duration:
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-28 sm:w-36 accent-blue-600 cursor-pointer"
          />
          <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {durationHours} {durationHours === 1 ? 'hour' : 'hours'}
          </span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Option A: Direct Campus Parking */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Option A: Direct Campus Parking
              </span>
              <span className="text-xs font-medium text-slate-500">
                {bestCampusOption.shortName}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                ${campusTotalParking.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                ${campusRate.toFixed(2)}/hr × {durationHours} hrs
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Parking Fee:</span>
                <span className="font-mono tabular-nums font-semibold">${campusTotalParking.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Bus Fare:</span>
                <span className="font-mono tabular-nums font-semibold">$0.00 (None)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Walking to Classroom:</span>
                <span className="font-semibold">{bestCampusOption.walkMinutesToSmu} min ({bestCampusOption.distanceToSmuMeters}m)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span>Queuing / Lot Hunt Risk:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {bestCampusOption.availableLots < 15 ? 'High (Entry delays)' : 'Moderate'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
              Best for:
            </span>
            Short visits (&lt; 2 hrs) or heavy rain when you need immediate sheltered access to Li Ka Shing Library or SCIS.
          </div>
        </div>

        {/* Option B: Park & Ride + Bus to Stop 04121 */}
        <div className="p-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Option B: Park &amp; Ride + Bus 04121
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {bestOuterOption.shortName}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                ${outerTotal.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parking (${outerParkingFee.toFixed(2)}) + 2-Way Bus ($2.18)
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
                <span>Outer Parking Fee (${outerRate.toFixed(2)}/hr):</span>
                <span className="font-mono tabular-nums font-semibold">${outerParkingFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
                <span>EZ-Link Bus Fare (2 trips):</span>
                <span className="font-mono tabular-nums font-semibold">$2.18</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
                <span>Bus Ride to Stop 04121:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  ~{bestOuterOption.recommendedBusToSmu?.busTravelMinutes || 4} mins
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
                <span>Lot Availability Guarantee:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  High ({bestOuterOption.availableLots} lots available)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-xs">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-0.5">
              Net Savings: ${savings > 0 ? savings.toFixed(2) : '0.00'}
            </span>
            Recommended for stays &ge; 2 hours or when SMU campus gantries are backed up.
          </div>
        </div>
      </div>
    </div>
  );
};
