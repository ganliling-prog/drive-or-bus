import React, { useState } from 'react';
import { Carpark, BusArrivalInfo } from '../types/commute';
import { MapPin, Bus, Car, Navigation, Info, ExternalLink } from 'lucide-react';

interface CampusMapVisualizerProps {
  carparks: Carpark[];
  busArrivals: BusArrivalInfo[];
  selectedCarparkId?: string;
  onSelectCarpark?: (carpark: Carpark) => void;
}

export const CampusMapVisualizer: React.FC<CampusMapVisualizerProps> = ({
  carparks,
  busArrivals,
  selectedCarparkId,
  onSelectCarpark,
}) => {
  const [activePin, setActivePin] = useState<string | null>(selectedCarparkId || 'SMU_BASEMENT');

  const selectedCarpark = carparks.find((c) => c.id === activePin) || carparks[0];
  const quickestBus = busArrivals[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            SMU Campus &amp; Transit Schematic
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic relationship between campus carparks, outer park-and-ride hubs, and Bus Stop 04121
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Bus Stop 04121
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            &gt;20 Lots Free
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            &lt;20 Lots Free
          </span>
        </div>
      </div>

      {/* Main Map Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
        {/* Schematic SVG / Canvas Map View */}
        <div className="lg:col-span-2 relative h-[440px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Major Roads in SMU Precinct */}
          {/* Stamford Road (horizontal through middle) */}
          <div className="absolute top-[54%] left-0 right-0 h-6 bg-slate-800/80 border-y border-slate-700/60 flex items-center justify-between px-6">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Stamford Road (One-Way to City Hall)
            </span>
            <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
              Bus Lane →
            </span>
          </div>

          {/* Bras Basah Road (horizontal parallel near top) */}
          <div className="absolute top-[32%] left-0 right-0 h-5 bg-slate-800/60 border-y border-slate-700/40 flex items-center px-6">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              Bras Basah Road (One-Way to Raffles Blvd)
            </span>
          </div>

          {/* Victoria Street (vertical through middle-right) */}
          <div className="absolute left-[54%] top-0 bottom-0 w-6 bg-slate-800/70 border-x border-slate-700/50 flex flex-col justify-between py-6 items-center">
            <span className="text-[9px] font-mono text-slate-400 [writing-mode:vertical-rl] rotate-180 uppercase tracking-wider">
              Victoria Street
            </span>
          </div>

          {/* North Bridge Road (vertical on far right) */}
          <div className="absolute left-[85%] top-0 bottom-0 w-5 bg-slate-800/50 border-x border-slate-700/40 flex flex-col justify-center items-center">
            <span className="text-[9px] font-mono text-slate-500 [writing-mode:vertical-rl] rotate-180 uppercase tracking-wider">
              North Bridge Rd
            </span>
          </div>

          {/* SMU Campus Core Polygons */}
          {/* Li Ka Shing Library & Admin */}
          <div className="absolute top-[40%] left-[40%] w-[120px] h-[58px] bg-blue-950/80 border border-blue-500/40 rounded-lg p-1.5 shadow-md flex flex-col justify-center">
            <span className="text-[10px] font-bold text-blue-200 leading-tight">
              SMU Li Ka Shing Lib
            </span>
            <span className="text-[9px] text-blue-400">Campus Central Hub</span>
          </div>

          {/* School of Accountancy & SCIS */}
          <div className="absolute top-[20%] left-[40%] w-[120px] h-[46px] bg-indigo-950/80 border border-indigo-500/40 rounded-lg p-1.5 shadow-md flex flex-col justify-center">
            <span className="text-[10px] font-bold text-indigo-200 leading-tight">
              SMU SOA &amp; SCIS
            </span>
            <span className="text-[9px] text-indigo-400">Connexion / SCIS 1</span>
          </div>

          {/* School of Law & Fort Canning */}
          <div className="absolute top-[40%] left-[16%] w-[110px] h-[54px] bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-300 leading-tight">
              SMU School of Law
            </span>
            <span className="text-[9px] text-slate-400">Armenian St / Fort Canning</span>
          </div>

          {/* BUS STOP 04121 PIN (Primary Anchor) */}
          <div
            className="absolute top-[52%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            title="Bus Stop 04121: Stamford Rd - SMU (Opp Li Ka Shing Library)"
          >
            <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-600 border-2 border-white shadow-lg text-white text-xs font-bold whitespace-nowrap animate-bounce">
              <Bus className="w-3.5 h-3.5" />
              <span>Stop 04121 (SMU)</span>
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-blue-300 whitespace-nowrap bg-slate-900/90 px-1.5 rounded">
              Next: {quickestBus?.serviceNo} in {quickestBus?.nextBus.estimatedArrivalMinutes}m
            </div>
          </div>

          {/* Carpark Location Pins */}
          {carparks.map((cp) => {
            const isSelected = cp.id === activePin;
            const isCampus = cp.zone === 'campus_core';
            const pinColor =
              cp.availableLots > 20
                ? 'bg-emerald-600 text-white'
                : cp.availableLots > 5
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white';

            return (
              <button
                key={cp.id}
                onClick={() => {
                  setActivePin(cp.id);
                  if (onSelectCarpark) onSelectCarpark(cp);
                }}
                style={{
                  left: `${cp.coordinates.mapX}%`,
                  top: `${cp.coordinates.mapY}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer transition-transform ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-mono font-bold shadow-md tabular-nums ${pinColor} ${
                    isSelected ? 'ring-2 ring-white border-white' : 'border-slate-800'
                  }`}
                >
                  <Car className="w-3 h-3" />
                  <span>{cp.availableLots}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-300 bg-slate-900/90 px-1.5 py-0.2 rounded mt-0.5 whitespace-nowrap group-hover:text-white">
                  {cp.shortName}
                </span>
              </button>
            );
          })}

          {/* Outer Park & Ride connector dashed paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Bras Basah HDB to 04121 */}
            <path
              d="M 78% 26% Q 65% 36%, 45% 52%"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            {/* Plaza Singapura to 04121 */}
            <path
              d="M 18% 22% Q 30% 36%, 45% 52%"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          </svg>

          {/* Map legend footer */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded backdrop-blur-xs">
            <span>Click any carpark marker to inspect walking time or bus connection</span>
            <span>Scale: ~1.2km radius</span>
          </div>
        </div>

        {/* Selected Carpark Detail Inspector */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Selected Facility</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {selectedCarpark.zone === 'campus_core' ? 'Campus Core' : 'Park & Ride'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {selectedCarpark.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              {selectedCarpark.address}
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Live Free Lots</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {selectedCarpark.availableLots} / {selectedCarpark.totalLots}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Distance to SMU</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {selectedCarpark.distanceToSmuMeters}m ({selectedCarpark.walkMinutesToSmu} min walk)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Weekday Day Rate</span>
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {selectedCarpark.weekdayRatePeak}
                </span>
              </div>

              {selectedCarpark.recommendedBusToSmu ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <Bus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Feeder Bus to Stop 04121:</span>
                  </div>
                  <div>
                    Board <span className="font-bold">Bus {selectedCarpark.recommendedBusToSmu.busNumber}</span> at {selectedCarpark.recommendedBusToSmu.boardingStop}.
                    Takes ~{selectedCarpark.recommendedBusToSmu.busTravelMinutes} minutes directly to the SMU Library doorstep.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-200">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Direct Campus Access:</span>
                  </div>
                  <div>
                    Underpass or street crossing connects directly into SMU concourse without public transport transfer.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 mt-4 text-xs text-slate-500">
            Latitude: {selectedCarpark.coordinates.lat.toFixed(4)}, Longitude: {selectedCarpark.coordinates.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
