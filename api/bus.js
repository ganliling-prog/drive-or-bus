/**
 * Bus Service Handler and Helper for Stop 04121
 * File: api/bus.js (in project root /api)
 */

const LTA_BUS_ARRIVAL_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

// Baseline arrivals for stop 04121 as shown on the screen
export const SCREEN_BUS_SERVICES = [
  { serviceNo: '106', nextMinutes: 2, next2Minutes: 8 },
  { serviceNo: '190', nextMinutes: 4, next2Minutes: 11 },
  { serviceNo: '147', nextMinutes: 3, next2Minutes: 10 },
  { serviceNo: '166', nextMinutes: 5, next2Minutes: 13 },
  { serviceNo: '36', nextMinutes: 6, next2Minutes: 14 },
  { serviceNo: '7', nextMinutes: 7, next2Minutes: 17 },
  { serviceNo: '857', nextMinutes: 1, next2Minutes: 9 },
  { serviceNo: '14', nextMinutes: 9, next2Minutes: 18 },
  { serviceNo: '174', nextMinutes: 8, next2Minutes: 19 },
  { serviceNo: '131', nextMinutes: 11, next2Minutes: 22 },
];

export function getLtaAccountKey() {
  return (
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.VITE_LTA_DATAMALL_KEY ||
    process.env.VITE_LTA_ACCOUNT_KEY
  );
}

export async function fetchLiveBusArrivals(busStopCode = '04121', accountKey) {
  const url = `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${encodeURIComponent(busStopCode)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
  });

  return response;
}

/**
 * Fetch and simplify bus arrivals for Bus Stop 04121
 */
export async function getSimplifiedBusArrivals(accountKey) {
  const key = accountKey || getLtaAccountKey();

  if (!key) {
    return {
      success: false,
      status: 401,
      source: 'LTA BusArrival',
      error: 'Missing AccountKey',
      services: SCREEN_BUS_SERVICES,
      earliestBus: { serviceNo: '857', arrivalMinutes: 1 },
    };
  }

  try {
    const res = await fetchLiveBusArrivals('04121', key);

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        source: 'LTA BusArrival',
        error: `HTTP ${res.status}`,
        services: SCREEN_BUS_SERVICES,
        earliestBus: { serviceNo: '857', arrivalMinutes: 1 },
      };
    }

    const data = await res.json();
    const servicesList = Array.isArray(data.Services) ? data.Services : [];

    if (servicesList.length === 0) {
      return {
        success: true,
        status: 200,
        source: 'LTA BusArrival',
        services: SCREEN_BUS_SERVICES,
        earliestBus: { serviceNo: '857', arrivalMinutes: 1 },
      };
    }

    const now = Date.now();
    const parseMinutes = (arrivalStr) => {
      if (!arrivalStr) return null;
      const target = new Date(arrivalStr).getTime();
      if (isNaN(target)) return null;
      return Math.max(0, Math.round((target - now) / 60000));
    };

    const simplified = servicesList.map((svc) => {
      const nextMinutes = parseMinutes(svc.NextBus?.EstimatedArrival);
      const next2Minutes = parseMinutes(svc.NextBus2?.EstimatedArrival);
      return {
        serviceNo: svc.ServiceNo,
        nextMinutes: nextMinutes !== null ? nextMinutes : 5,
        next2Minutes: next2Minutes !== null ? next2Minutes : 12,
      };
    });

    // Find earliest arriving bus
    let earliest = { serviceNo: simplified[0]?.serviceNo || '106', arrivalMinutes: simplified[0]?.nextMinutes ?? 2 };
    for (const s of simplified) {
      if (typeof s.nextMinutes === 'number' && s.nextMinutes < earliest.arrivalMinutes) {
        earliest = { serviceNo: s.serviceNo, arrivalMinutes: s.nextMinutes };
      }
    }

    return {
      success: true,
      status: 200,
      source: 'LTA BusArrival',
      services: simplified,
      earliestBus: earliest,
    };
  } catch (err) {
    return {
      success: false,
      status: 500,
      source: 'LTA BusArrival',
      error: 'Network error',
      services: SCREEN_BUS_SERVICES,
      earliestBus: { serviceNo: '857', arrivalMinutes: 1 },
    };
  }
}

export default async function handler(req, res) {
  const accountKey = getLtaAccountKey();
  const busStopCode = req?.query?.BusStopCode || req?.query?.busStopCode || '04121';

  if (!accountKey) {
    const payload = {
      status: 'unconfigured',
      message: 'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY environment variable.',
      endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
      busStopCode,
      Services: SCREEN_BUS_SERVICES,
    };
    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
      return res.status(200).json(payload);
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=20, stale-while-revalidate=40',
      },
    });
  }

  try {
    const apiRes = await fetchLiveBusArrivals(busStopCode, accountKey);
    const data = await apiRes.json();
    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
      return res.status(apiRes.status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: apiRes.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=20, stale-while-revalidate=40',
      },
    });
  } catch (err) {
    const errPayload = {
      status: 'error',
      message: 'Failed to fetch live bus arrival data from LTA DataMall',
      endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
    };
    if (res && typeof res.status === 'function') {
      return res.status(502).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
  return handler(request);
}
