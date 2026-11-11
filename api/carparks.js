/**
 * Carpark Service Handler and Helper for SMU Precinct
 * File: api/carparks.js (in project root /api)
 */

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

// The 10 car parks our screen shows with their lots free
export const SCREEN_CARPARKS = [
  { id: 'SMU_BASEMENT', name: 'SMU Basement Carpark', availableLots: 18, totalLots: 220 },
  { id: 'CHIJMES', name: 'CHIJMES Carpark', availableLots: 24, totalLots: 165 },
  { id: 'CAPITOL_SG', name: 'Capitol Singapore Carpark', availableLots: 42, totalLots: 210 },
  { id: 'RAFFLES_CITY', name: 'Raffles City Shopping Centre', availableLots: 88, totalLots: 480 },
  { id: 'NLB_VICTORIA', name: 'National Library Building (NLB)', availableLots: 35, totalLots: 195 },
  { id: 'FORT_CANNING', name: 'Fort Canning Carpark (ROM / Registry)', availableLots: 8, totalLots: 85 },
  { id: 'BRAS_BASAH_COMPLEX', name: 'Bras Basah Complex (HDB)', availableLots: 142, totalLots: 340 },
  { id: 'WATERLOO_CENTRE', name: 'Waterloo Centre (HDB)', availableLots: 118, totalLots: 290 },
  { id: 'PLAZA_SINGAPURA', name: 'Plaza Singapura / The Atrium', availableLots: 310, totalLots: 720 },
  { id: 'ALBERT_CENTRE', name: 'Albert Centre Market & Food Centre (HDB)', availableLots: 195, totalLots: 380 },
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

export async function fetchLiveCarparks(accountKey) {
  const response = await fetch(LTA_CARPARK_API_URL, {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
  });

  return response;
}

/**
 * Fetch and simplify carpark lots for the screen's 10 carparks
 */
export async function getCarparksReading(accountKey) {
  const key = accountKey || getLtaAccountKey();

  if (!key) {
    // Top carpark among screen carparks (Plaza Singapura with 310 lots)
    const topCarpark = [...SCREEN_CARPARKS].sort((a, b) => b.availableLots - a.availableLots)[0];
    return {
      success: false,
      status: 401,
      source: 'LTA CarParkAvailability',
      error: 'Missing AccountKey',
      carparks: SCREEN_CARPARKS,
      topCarpark,
    };
  }

  try {
    const res = await fetchLiveCarparks(key);

    if (!res.ok) {
      const topCarpark = [...SCREEN_CARPARKS].sort((a, b) => b.availableLots - a.availableLots)[0];
      return {
        success: false,
        status: res.status,
        source: 'LTA CarParkAvailability',
        error: `HTTP ${res.status}`,
        carparks: SCREEN_CARPARKS,
        topCarpark,
      };
    }

    const data = await res.json();
    const ltaCarparks = Array.isArray(data.value) ? data.value : [];

    // Map live lots to screen carparks where possible
    const updatedCarparks = SCREEN_CARPARKS.map((cp) => {
      const match = ltaCarparks.find((lta) => {
        const dev = (lta.Development || '').toUpperCase();
        const cpName = cp.name.toUpperCase();
        return (
          dev.includes(cp.id) ||
          dev.includes(cpName) ||
          (cp.id === 'RAFFLES_CITY' && dev.includes('RAFFLES CITY')) ||
          (cp.id === 'CAPITOL_SG' && dev.includes('CAPITOL')) ||
          (cp.id === 'CHIJMES' && dev.includes('CHIJMES')) ||
          (cp.id === 'BRAS_BASAH_COMPLEX' && dev.includes('BRAS BASAH')) ||
          (cp.id === 'PLAZA_SINGAPURA' && dev.includes('PLAZA SING')) ||
          (cp.id === 'ALBERT_CENTRE' && dev.includes('ALBERT'))
        );
      });

      if (match && typeof match.AvailableLots === 'number') {
        return {
          ...cp,
          availableLots: match.AvailableLots,
        };
      }
      return cp;
    });

    const topCarpark = [...updatedCarparks].sort((a, b) => b.availableLots - a.availableLots)[0];

    return {
      success: true,
      status: 200,
      source: 'LTA CarParkAvailability',
      carparks: updatedCarparks,
      topCarpark,
    };
  } catch (err) {
    const topCarpark = [...SCREEN_CARPARKS].sort((a, b) => b.availableLots - a.availableLots)[0];
    return {
      success: false,
      status: 500,
      source: 'LTA CarParkAvailability',
      error: 'Network error',
      carparks: SCREEN_CARPARKS,
      topCarpark,
    };
  }
}

export default async function handler(req, res) {
  const accountKey = getLtaAccountKey();

  if (!accountKey) {
    const payload = {
      status: 'unconfigured',
      message: 'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY environment variable.',
      endpoint: LTA_CARPARK_API_URL,
      value: SCREEN_CARPARKS,
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
    const apiRes = await fetchLiveCarparks(accountKey);
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
      message: 'Failed to fetch live carpark data from LTA DataMall',
      endpoint: LTA_CARPARK_API_URL,
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
