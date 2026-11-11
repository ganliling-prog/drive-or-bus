import { Carpark, BusArrivalInfo, RecommendationResult, UserPreferences, LotAvailabilityStatus } from '../types/commute';
import { INITIAL_CARPARKS, INITIAL_BUS_ARRIVALS } from '../data/mockData';

export function calculateStatus(available: number, total: number): LotAvailabilityStatus {
  const ratio = available / total;
  if (available <= 5) return 'full';
  if (ratio < 0.15 || available < 20) return 'limited';
  if (ratio < 0.35) return 'moderate';
  return 'abundant';
}

export function evaluateCommuteDecision(
  carparks: Carpark[],
  busArrivals: BusArrivalInfo[],
  preferences: UserPreferences
): RecommendationResult {
  const campusCarparks = carparks.filter(c => c.zone === 'campus_core');
  const outerCarparks = carparks.filter(c => c.zone === 'outer_park_and_ride');

  const campusLotsAvailable = campusCarparks.reduce((sum, c) => sum + c.availableLots, 0);
  const totalCampusCapacity = campusCarparks.reduce((sum, c) => sum + c.totalLots, 0);
  const outerLotsAvailable = outerCarparks.reduce((sum, c) => sum + c.availableLots, 0);

  // Best campus carpark option (sorted by lots availability and walk distance)
  const bestCampusOption = [...campusCarparks].sort((a, b) => {
    // prefer carparks with >15 lots, then closest
    if (a.availableLots > 15 && b.availableLots <= 15) return -1;
    if (b.availableLots > 15 && a.availableLots <= 15) return 1;
    return a.distanceToSmuMeters - b.distanceToSmuMeters;
  })[0] || campusCarparks[0];

  // Best outer option (cheapest rate + high lots + good bus connection)
  const bestOuterOption = [...outerCarparks].sort((a, b) => {
    return (a.hourlyRateNumeric + (a.walkMinutesToSmu * 0.1)) - (b.hourlyRateNumeric + (b.walkMinutesToSmu * 0.1));
  })[0] || outerCarparks[0];

  // Find quickest bus connecting to stop 04121
  const sortedBuses = [...busArrivals].sort(
    (a, b) => a.nextBus.estimatedArrivalMinutes - b.nextBus.estimatedArrivalMinutes
  );
  const quickestBus = sortedBuses[0] || {
    serviceNo: '106',
    nextBus: { estimatedArrivalMinutes: 3, load: 'SEA' as const },
    connectsFromOuterCarparks: ['Plaza Singapura']
  };

  // Congestion score (1-10) based on campus lots availability
  let campusCongestionScore = 1;
  const occupancyRatio = (totalCampusCapacity - campusLotsAvailable) / totalCampusCapacity;
  if (occupancyRatio > 0.90 || campusLotsAvailable < 25) {
    campusCongestionScore = 9;
  } else if (occupancyRatio > 0.80 || campusLotsAvailable < 60) {
    campusCongestionScore = 7;
  } else if (occupancyRatio > 0.65) {
    campusCongestionScore = 5;
  } else {
    campusCongestionScore = 2;
  }

  // Cost calculation for stay duration
  const stayHours = preferences.stayDurationHours;
  const campusCost = Number((bestCampusOption.hourlyRateNumeric * stayHours).toFixed(2));
  // Outer cost = outer parking fee + return bus fare ($1.09 each way = $2.18)
  const busFareReturn = 2.18;
  const parkAndRideCost = Number(((bestOuterOption.hourlyRateNumeric * stayHours) + busFareReturn).toFixed(2));
  const savings = Number(Math.max(0, campusCost - parkAndRideCost).toFixed(2));

  // Time calculation
  // Campus: Drive in (heavy city queue if congested) + search time + walk to SMU
  const campusSearchTime = campusLotsAvailable < 20 ? 10 : campusLotsAvailable < 50 ? 5 : 2;
  const campusMinutes = bestCampusOption.walkMinutesToSmu + campusSearchTime + 2;

  // Park & ride: quick park at outer (plenty lots, 2 min) + wait for bus + bus ride + 1 min walk from 04121
  const outerBusWait = quickestBus.nextBus.estimatedArrivalMinutes;
  const outerBusRide = bestOuterOption.recommendedBusToSmu?.busTravelMinutes || 4;
  const parkAndRideMinutes = 2 + outerBusWait + outerBusRide + 1;
  const deltaMinutes = parkAndRideMinutes - campusMinutes;

  // Verdict evaluation logic
  let verdict: 'PARK_NEAR_CAMPUS' | 'PARK_FURTHER_OUT' | 'BORDERLINE' = 'PARK_NEAR_CAMPUS';
  let headline = '';
  let summary = '';
  const keyFactors: string[] = [];

  if (preferences.priority === 'save_money' && savings >= 5) {
    verdict = 'PARK_FURTHER_OUT';
    headline = 'Park Further Out & Take Bus (Saves Money)';
    summary = `Parking at ${bestOuterOption.shortName} saves you $${savings.toFixed(2)} for a ${stayHours}-hour stay. Buses drop you off directly at Stop 04121 in ~${outerBusRide} minutes.`;
    keyFactors.push(`Saves $${savings.toFixed(2)} vs SMU campus carparks`);
    keyFactors.push(`Direct bus ${quickestBus.serviceNo} arrives in ${outerBusWait} min at connection stop`);
    keyFactors.push(`${bestOuterOption.availableLots} abundant lots available at ${bestOuterOption.shortName}`);
  } else if (campusLotsAvailable < preferences.minLotsThreshold || campusLotsAvailable <= 20) {
    verdict = 'PARK_FURTHER_OUT';
    headline = 'Park Further Out: Campus Lots Critical';
    summary = `Only ${campusLotsAvailable} lots remain across campus carparks with high queuing risk. Recommend parking at ${bestOuterOption.shortName} and boarding Bus ${quickestBus.serviceNo} to Stop 04121.`;
    keyFactors.push(`Campus capacity critical: ${campusLotsAvailable} free lots (${Math.round(occupancyRatio * 100)}% occupied)`);
    keyFactors.push(`High risk of getting stuck at campus entry gantries`);
    keyFactors.push(`${bestOuterOption.availableLots} guaranteed lots at ${bestOuterOption.shortName}`);
    keyFactors.push(`Bus Stop 04121 has frequent buses every 2-4 minutes`);
  } else if (campusLotsAvailable >= 50 && preferences.priority !== 'save_money') {
    verdict = 'PARK_NEAR_CAMPUS';
    headline = 'Park Near Campus: Plentiful Lots Free';
    summary = `${campusLotsAvailable} lots free within 300m of SMU. Park directly at ${bestCampusOption.shortName} (${bestCampusOption.availableLots} lots free, ${bestCampusOption.walkMinutesToSmu} min walk).`;
    keyFactors.push(`${campusLotsAvailable} free lots nearby (SMU Basement & surroundings)`);
    keyFactors.push(`Direct lift / underpass access to SMU buildings`);
    keyFactors.push(`Zero bus transfer time needed`);
  } else {
    // Borderline / Moderate
    if (preferences.priority === 'save_time') {
      verdict = 'PARK_NEAR_CAMPUS';
      headline = 'Park Near Campus (Faster Commute)';
      summary = `Moderate availability (${campusLotsAvailable} lots). Target ${bestCampusOption.shortName} for immediate ${bestCampusOption.walkMinutesToSmu}-min walk to campus.`;
      keyFactors.push(`Direct access saves ~${Math.abs(deltaMinutes)} mins of transit transfers`);
      keyFactors.push(`${bestCampusOption.availableLots} lots open at ${bestCampusOption.shortName}`);
    } else {
      verdict = 'BORDERLINE';
      headline = 'Balanced Choice: Outer Parking Highly Viable';
      summary = `Campus has ${campusLotsAvailable} lots, but ${bestOuterOption.shortName} will save $${savings.toFixed(2)} with only a ${Math.max(1, deltaMinutes)}-min difference via Bus 04121.`;
      keyFactors.push(`Cost saving: $${savings.toFixed(2)} on parking fee`);
      keyFactors.push(`Campus option: ${bestCampusOption.shortName} (${bestCampusOption.availableLots} lots)`);
      keyFactors.push(`Transit option: Bus ${quickestBus.serviceNo} arriving in ${outerBusWait} mins`);
    }
  }

  return {
    verdict,
    headline,
    summary,
    campusLotsAvailable,
    totalCampusCapacity,
    outerLotsAvailable,
    campusCongestionScore,
    bestCampusOption,
    bestOuterOption,
    fastestBusToStop04121: {
      busNumber: quickestBus.serviceNo,
      waitMinutes: outerBusWait,
      boardingStop: bestOuterOption.recommendedBusToSmu?.boardingStop || 'Nearest Stop',
    },
    timeTradeoff: {
      campusMinutes,
      parkAndRideMinutes,
      deltaMinutes,
    },
    costTradeoff: {
      campusCost,
      parkAndRideCost,
      savings,
    },
    keyFactors,
  };
}

export function generateScenarioData(preset: UserPreferences['scenarioPreset']): {
  carparks: Carpark[];
  busArrivals: BusArrivalInfo[];
} {
  const baseCarparks: Carpark[] = JSON.parse(JSON.stringify(INITIAL_CARPARKS));
  const baseBuses: BusArrivalInfo[] = JSON.parse(JSON.stringify(INITIAL_BUS_ARRIVALS));

  if (preset === 'morning_peak') {
    // 08:30 AM: campus lots critically low, SMU basement virtually full
    baseCarparks.forEach(c => {
      if (c.zone === 'campus_core') {
        if (c.id === 'SMU_BASEMENT') {
          c.availableLots = 3;
          c.occupancyPercent = 99;
          c.status = 'full';
          c.trend = 'filling_fast';
          c.trendLotsDelta = -8;
        } else if (c.id === 'CHIJMES') {
          c.availableLots = 6;
          c.occupancyPercent = 96;
          c.status = 'limited';
        } else if (c.id === 'CAPITOL_SG') {
          c.availableLots = 11;
          c.occupancyPercent = 95;
          c.status = 'limited';
        } else {
          c.availableLots = Math.max(2, Math.floor(c.totalLots * 0.05));
          c.occupancyPercent = 95;
          c.status = 'limited';
        }
      } else {
        // Outer lots still healthy
        c.availableLots = Math.floor(c.totalLots * 0.45);
        c.status = 'moderate';
      }
    });

    // High bus frequency in morning rush
    baseBuses.forEach(b => {
      b.nextBus.estimatedArrivalMinutes = Math.floor(Math.random() * 3) + 1;
      b.nextBus.load = 'SDA';
    });
  } else if (preset === 'lunch_rush') {
    // 12:30 PM: high turnover at Raffles City and CHIJMES restaurants
    baseCarparks.forEach(c => {
      if (c.id === 'SMU_BASEMENT') {
        c.availableLots = 14;
        c.status = 'limited';
      } else if (c.id === 'RAFFLES_CITY' || c.id === 'CHIJMES') {
        c.availableLots = Math.floor(c.totalLots * 0.12);
        c.status = 'limited';
      }
    });
  } else if (preset === 'evening_class') {
    // 18:30 PM: Office workers leave, campus lots open up, flat evening rates active
    baseCarparks.forEach(c => {
      if (c.zone === 'campus_core') {
        c.availableLots = Math.floor(c.totalLots * 0.38);
        c.occupancyPercent = 62;
        c.status = 'moderate';
        c.trend = 'emptying';
        c.trendLotsDelta = +9;
      }
    });
  } else if (preset === 'weekend') {
    // Weekend: SMU basement empty (~150 lots), shopping malls crowded
    baseCarparks.forEach(c => {
      if (c.id === 'SMU_BASEMENT') {
        c.availableLots = 155;
        c.occupancyPercent = 30;
        c.status = 'abundant';
      } else if (c.id === 'RAFFLES_CITY' || c.id === 'CAPITOL_SG') {
        c.availableLots = 25;
        c.status = 'limited';
      }
    });
  }

  return { carparks: baseCarparks, busArrivals: baseBuses };
}
