import React from 'react';
import { RecommendationResult, UserPreferences } from '../types/commute';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, Bus, MapPin } from 'lucide-react';

interface DecisionHeroProps {
  recommendation: RecommendationResult;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  lastUpdated: Date;
}

export const DecisionHero: React.FC<DecisionHeroProps> = ({
  recommendation,
  preferences,
  onUpdatePreferences,
  lastUpdated,
}) => {
  const isParkNear = recommendation.verdict === 'PARK_NEAR_CAMPUS';
  const isParkOuter = recommendation.verdict === 'PARK_FURTHER_OUT';

  const badgeBg = isParkNear
    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    : isParkOuter
    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800'
    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';

  return (
    <section className="mb-8">
      {/* Scenario Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <span className="px-2 py-1 font-semibold text-slate-500 dark:text-slate-400">
            Scenario Preset:
          </span>
          <button
            onClick={() => onUpdatePreferences({ scenarioPreset: 'live' })}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              preferences.scenarioPreset === 'live'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Simulated Live
          </button>
          <button
            onClick={() => onUpdatePreferences({ scenarioPreset: 'morning_peak' })}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              preferences.scenarioPreset === 'morning_peak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Morning Peak (08:30)
          </button>
          <button
            onClick={() => onUpdatePreferences({ scenarioPreset: 'lunch_rush' })}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              preferences.scenarioPreset === 'lunch_rush'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lunch Rush (12:30)
          </button>
          <button
            onClick={() => onUpdatePreferences({ scenarioPreset: 'evening_class' })}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              preferences.scenarioPreset === 'evening_class'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Evening Class (18:30)
          </button>
          <button
            onClick={() => onUpdatePreferences({ scenarioPreset: 'weekend' })}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              preferences.scenarioPreset === 'weekend'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekend
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Target Destination: SMU Campus Core</span>
          <span aria-hidden="true">·</span>
          <span>Bus Stop 04121 (Stamford Rd)</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Primary Decision Banner */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${badgeBg}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
              {isParkNear ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Commute Verdict: Direct Campus Parking Recommended</span>
                </>
              ) : isParkOuter ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Commute Verdict: Park Further Out &amp; Bus To Stop 04121</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Commute Verdict: Flexible / Cost-Saving Opportunity</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              {recommendation.headline}
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              {recommendation.summary}
            </p>

            {/* Key reasoning checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {recommendation.keyFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Suggestion Box */}
          <div className="lg:w-80 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Top Recommended Plan
            </div>
            {isParkNear ? (
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Drive directly to {recommendation.bestCampusOption.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Free Lots Now:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {recommendation.bestCampusOption.availableLots} lots
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Walking to SMU:</span>
                    <span className="font-semibold tabular-nums">
                      {recommendation.bestCampusOption.walkMinutesToSmu} min ({recommendation.bestCampusOption.distanceToSmuMeters}m)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Rate:</span>
                    <span className="font-semibold tabular-nums">{recommendation.bestCampusOption.weekdayRatePeak}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Park at {recommendation.bestOuterOption.shortName} + Bus {recommendation.fastestBusToStop04121.busNumber}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Outer Available Lots:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {recommendation.bestOuterOption.availableLots} lots
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bus to Stop 04121:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      Bus {recommendation.fastestBusToStop04121.busNumber} (~{recommendation.fastestBusToStop04121.waitMinutes}m wait)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost Savings ({preferences.stayDurationHours}h stay):</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      Save ${recommendation.costTradeoff.savings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>View Route Options Below</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* High-Density Tabular Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Campus Lots Free</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {recommendation.campusLotsAvailable}
            </span>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              / {recommendation.totalCampusCapacity}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across 6 campus-adjacent carparks
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bus Stop 04121</span>
            <Bus className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {recommendation.fastestBusToStop04121.waitMinutes}m
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              (Bus {recommendation.fastestBusToStop04121.busNumber})
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Opp SMU Li Ka Shing Library
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cost Differential</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">SAVINGS</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ${recommendation.costTradeoff.savings.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              ({preferences.stayDurationHours}h stay)
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Outer HDB vs Campus Basement
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Time Trade-off</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {recommendation.timeTradeoff.deltaMinutes > 0
                ? `+${recommendation.timeTradeoff.deltaMinutes}m`
                : `${recommendation.timeTradeoff.deltaMinutes}m`}
            </span>
            <span className="text-xs text-slate-500">
              via Park &amp; Ride
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Includes bus ride + 1 min walk
          </div>
        </div>
      </div>

      {/* Interactive Commute Customizer Controls */}
      <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Stay Duration selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Expected Stay:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            {[1, 2, 4, 8].map((hours) => (
              <button
                key={hours}
                onClick={() => onUpdatePreferences({ stayDurationHours: hours })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer tabular-nums ${
                  preferences.stayDurationHours === hours
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {hours} {hours === 1 ? 'hr' : 'hrs'}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Priority:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => onUpdatePreferences({ priority: 'balanced' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                preferences.priority === 'balanced'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Balanced
            </button>
            <button
              onClick={() => onUpdatePreferences({ priority: 'save_money' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                preferences.priority === 'save_money'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Save Money
            </button>
            <button
              onClick={() => onUpdatePreferences({ priority: 'save_time' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                preferences.priority === 'save_time'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Save Time
            </button>
          </div>
        </div>

        {/* Safety buffer threshold */}
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Min Lots Buffer:</span>
          <select
            value={preferences.minLotsThreshold}
            onChange={(e) => onUpdatePreferences({ minLotsThreshold: Number(e.target.value) })}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 text-xs cursor-pointer font-mono"
          >
            <option value={10}>10 lots (Risky)</option>
            <option value={20}>20 lots (Standard)</option>
            <option value={35}>35 lots (Cautious)</option>
            <option value={50}>50 lots (Safe)</option>
          </select>
        </div>
      </div>
    </section>
  );
};
