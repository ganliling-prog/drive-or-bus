export type ParkingZone = 'campus_core' | 'outer_park_and_ride';

export type LotAvailabilityStatus = 'abundant' | 'moderate' | 'limited' | 'full';

export type CrowdLevel = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing (LTA Standard)

export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy

export interface Carpark {
  id: string;
  name: string;
  shortName: string;
  zone: ParkingZone;
  address: string;
  distanceToSmuMeters: number;
  walkMinutesToSmu: number;
  totalLots: number;
  availableLots: number;
  occupancyPercent: number;
  status: LotAvailabilityStatus;
  trend: 'filling_fast' | 'stable' | 'emptying';
  trendLotsDelta: number; // e.g. -5 lots in last 15 min
  weekdayRatePeak: string; // e.g. "$4.50/hr"
  weekdayRateOffPeak: string; // e.g. "$2.20/hr"
  hourlyRateNumeric: number;
  heightLimitMeters: number;
  hasEvCharging: boolean;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // percentage coordinates for visual schematic
    mapY: number;
  };
  recommendedBusToSmu?: {
    busNumber: string;
    boardingStop: string;
    stopsCount: number;
    busTravelMinutes: number;
  };
}

export interface BusArrivalInfo {
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS';
  destination: string;
  originArea: string;
  connectsFromOuterCarparks: string[]; // Carpark names this bus connects from
  nextBus: {
    estimatedArrivalMinutes: number; // 0 = Arr, 1, 2, ...
    load: CrowdLevel;
    feature: 'WAB' | '';
    type: BusType;
  };
  nextBus2?: {
    estimatedArrivalMinutes: number;
    load: CrowdLevel;
    feature: 'WAB' | '';
    type: BusType;
  };
  nextBus3?: {
    estimatedArrivalMinutes: number;
    load: CrowdLevel;
    feature: 'WAB' | '';
    type: BusType;
  };
}

export type CommuteVerdict = 'PARK_NEAR_CAMPUS' | 'PARK_FURTHER_OUT' | 'BORDERLINE';

export interface RecommendationResult {
  verdict: CommuteVerdict;
  headline: string;
  summary: string;
  campusLotsAvailable: number;
  totalCampusCapacity: number;
  outerLotsAvailable: number;
  campusCongestionScore: number; // 1-10 (10 = critical gridlock)
  bestCampusOption: Carpark;
  bestOuterOption: Carpark;
  fastestBusToStop04121: {
    busNumber: string;
    waitMinutes: number;
    boardingStop: string;
  };
  timeTradeoff: {
    campusMinutes: number; // driving + queuing + parking + walking
    parkAndRideMinutes: number; // driving + parking + bus + walk
    deltaMinutes: number;
  };
  costTradeoff: {
    campusCost: number; // for requested duration
    parkAndRideCost: number; // outer carpark + bus fares
    savings: number;
  };
  keyFactors: string[];
}

export interface UserPreferences {
  stayDurationHours: number;
  priority: 'balanced' | 'save_money' | 'save_time';
  walkingToleranceMinutes: number;
  minLotsThreshold: number;
  scenarioPreset: 'live' | 'morning_peak' | 'lunch_rush' | 'evening_class' | 'weekend';
}
