/**
 * Serverless Health Check Endpoint
 * Route: /api/health
 */

export function getLtaAccountKey(): string | undefined {
  return (
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.VITE_LTA_DATAMALL_KEY ||
    process.env.VITE_LTA_ACCOUNT_KEY
  );
}

export async function GET(request?: Request) {
  const accountKey = getLtaAccountKey();
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SMU Carpark & Bus Stop 04121 Commute API',
    ltaAccountKeyConfigured: Boolean(accountKey),
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Service health status & LTA key configuration check',
      },
      {
        path: '/api/carparkavailability',
        method: 'GET',
        description: 'Live carpark lots (HDB + LTA + URA) from LTA DataMall',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      },
      {
        path: '/api/busarrival',
        method: 'GET',
        description: 'Next bus arrival countdowns for Stop 04121 (or custom ?BusStopCode=)',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121',
      },
    ],
  };

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// Serverless / Express handler compatibility (Vercel, Node, Express)
export default async function handler(req: any, res: any) {
  const accountKey = getLtaAccountKey();
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SMU Carpark & Bus Stop 04121 Commute API',
    ltaAccountKeyConfigured: Boolean(accountKey),
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Service health status & LTA key configuration check',
      },
      {
        path: '/api/carparkavailability',
        method: 'GET',
        description: 'Live carpark lots (HDB + LTA + URA) from LTA DataMall',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      },
      {
        path: '/api/busarrival',
        method: 'GET',
        description: 'Next bus arrival countdowns for Stop 04121 (or custom ?BusStopCode=)',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121',
      },
    ],
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }

  return GET();
}
