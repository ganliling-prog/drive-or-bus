import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DecisionHero } from './components/DecisionHero';
import { CarparkList } from './components/CarparkList';
import { BusArrivalBoard } from './components/BusArrivalBoard';
import { CampusMapVisualizer } from './components/CampusMapVisualizer';
import { CostComparisonMatrix } from './components/CostComparisonMatrix';
import { BackendGuideModal } from './components/BackendGuideModal';
import { Carpark, BusArrivalInfo, UserPreferences, RecommendationResult } from './types/commute';
import { INITIAL_CARPARKS, INITIAL_BUS_ARRIVALS } from './data/mockData';
import { evaluateCommuteDecision, generateScenarioData } from './services/commuteService';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [busArrivals, setBusArrivals] = useState<BusArrivalInfo[]>(INITIAL_BUS_ARRIVALS);
  const [preferences, setPreferences] = useState<UserPreferences>({
    stayDurationHours: 2,
    priority: 'balanced',
    walkingToleranceMinutes: 5,
    minLotsThreshold: 20,
    scenarioPreset: 'live',
  });

  const [activeTab, setActiveTab] = useState<'all' | 'decision' | 'carparks' | 'bus' | 'map' | 'cost'>('all');
  const [selectedCarparkId, setSelectedCarparkId] = useState<string>('SMU_BASEMENT');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Backend integration state
  const [backendGuideOpen, setBackendGuideOpen] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState('');
  const [isUsingCustomBackend, setIsUsingCustomBackend] = useState(false);

  // Compute recommendation
  const recommendation: RecommendationResult = evaluateCommuteDecision(
    carparks,
    busArrivals,
    preferences
  );

  // Handle scenario preset change
  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      if (updates.scenarioPreset && updates.scenarioPreset !== prev.scenarioPreset) {
        if (updates.scenarioPreset === 'live') {
          setCarparks(INITIAL_CARPARKS);
          setBusArrivals(INITIAL_BUS_ARRIVALS);
        } else {
          const scenario = generateScenarioData(updates.scenarioPreset);
          setCarparks(scenario.carparks);
          setBusArrivals(scenario.busArrivals);
        }
        setLastUpdated(new Date());
      }
      return next;
    });
  };

  // Manual refresh logic
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    if (isUsingCustomBackend && customBackendUrl) {
      try {
        const [carparksRes, busRes] = await Promise.all([
          fetch(`${customBackendUrl}/carparks`),
          fetch(`${customBackendUrl}/bus/04121`),
        ]);
        if (carparksRes.ok) {
          const data = await carparksRes.json();
          setCarparks(data);
        }
        if (busRes.ok) {
          const data = await busRes.json();
          setBusArrivals(data);
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to simulated live fluctuation', err);
      }
    } else {
      // Simulate live jitter
      setCarparks((prev) =>
        prev.map((c) => {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newAvailable = Math.max(0, Math.min(c.totalLots, c.availableLots + delta));
          const newOccupancy = Math.round(((c.totalLots - newAvailable) / c.totalLots) * 100);
          return {
            ...c,
            availableLots: newAvailable,
            occupancyPercent: newOccupancy,
            trendLotsDelta: delta,
          };
        })
      );

      // Decrement or loop bus countdowns
      setBusArrivals((prev) =>
        prev.map((b) => {
          const currentArr = b.nextBus.estimatedArrivalMinutes;
          const nextArr = currentArr <= 0 ? Math.floor(Math.random() * 6) + 4 : currentArr - 1;
          return {
            ...b,
            nextBus: {
              ...b.nextBus,
              estimatedArrivalMinutes: nextArr,
            },
          };
        })
      );
    }

    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 400);
  }, [isUsingCustomBackend, customBackendUrl]);

  // Periodic subtle tick for live simulation
  useEffect(() => {
    if (preferences.scenarioPreset !== 'live') return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 25000);

    return () => clearInterval(interval);
  }, [preferences.scenarioPreset, handleRefresh]);

  const handleSelectCarpark = (carpark: Carpark) => {
    setSelectedCarparkId(carpark.id);
  };

  const handleSelectCarparkConnection = (carparkName: string) => {
    const found = carparks.find((c) => c.shortName.toLowerCase().includes(carparkName.toLowerCase()));
    if (found) {
      setSelectedCarparkId(found.id);
      setActiveTab('carparks');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenBackendGuide={() => setBackendGuideOpen(true)}
      />

      {/* Main Viewport Container (Desktop baseline 1440px / max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Core Decision Engine (Always prominent or active) */}
        {(activeTab === 'all' || activeTab === 'decision') && (
          <DecisionHero
            recommendation={recommendation}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            lastUpdated={lastUpdated}
          />
        )}

        {/* Tab view routing or combined layout */}
        {activeTab === 'all' && (
          <div className="space-y-8">
            <CarparkList
              carparks={carparks}
              onSelectCarpark={handleSelectCarpark}
              selectedCarparkId={selectedCarparkId}
            />

            <BusArrivalBoard
              busArrivals={busArrivals}
              onSelectCarparkConnection={handleSelectCarparkConnection}
            />

            <CampusMapVisualizer
              carparks={carparks}
              busArrivals={busArrivals}
              selectedCarparkId={selectedCarparkId}
              onSelectCarpark={handleSelectCarpark}
            />

            <CostComparisonMatrix
              durationHours={preferences.stayDurationHours}
              setDurationHours={(h) => handleUpdatePreferences({ stayDurationHours: h })}
              bestCampusOption={recommendation.bestCampusOption}
              bestOuterOption={recommendation.bestOuterOption}
            />
          </div>
        )}

        {activeTab === 'carparks' && (
          <CarparkList
            carparks={carparks}
            onSelectCarpark={handleSelectCarpark}
            selectedCarparkId={selectedCarparkId}
          />
        )}

        {activeTab === 'bus' && (
          <BusArrivalBoard
            busArrivals={busArrivals}
            onSelectCarparkConnection={handleSelectCarparkConnection}
          />
        )}

        {activeTab === 'map' && (
          <CampusMapVisualizer
            carparks={carparks}
            busArrivals={busArrivals}
            selectedCarparkId={selectedCarparkId}
            onSelectCarpark={handleSelectCarpark}
          />
        )}

        {activeTab === 'cost' && (
          <CostComparisonMatrix
            durationHours={preferences.stayDurationHours}
            setDurationHours={(h) => handleUpdatePreferences({ stayDurationHours: h })}
            bestCampusOption={recommendation.bestCampusOption}
            bestOuterOption={recommendation.bestOuterOption}
          />
        )}
      </main>

      {/* Backend Specification & Proxy Configuration Modal */}
      <BackendGuideModal
        isOpen={backendGuideOpen}
        onClose={() => setBackendGuideOpen(false)}
        customBackendUrl={customBackendUrl}
        setCustomBackendUrl={setCustomBackendUrl}
        isUsingCustomBackend={isUsingCustomBackend}
        setIsUsingCustomBackend={setIsUsingCustomBackend}
      />

      {/* Clean Unboxed Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>SMU Commute Advisor</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Singapore Management University (Bras Basah / Stamford Rd)</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Bus Stop 04121</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBackendGuideOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              LTA DataMall API Contracts
            </button>
            <span aria-hidden="true">·</span>
            <span>Ready for Backend Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
