/**
 * Serverless Bus Arrival Endpoint
 * Route: /api/busarrival
 * 
 * Pulls next buses at Bus Stop 04121 (v3 - current LTA DataMall version; ~20-second refresh):
 * https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * 
 * Header: AccountKey: <Your LTA DataMall Key>
 */

const LTA_BUS_ARRIVAL_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

export function getLtaAccountKey(): string | undefined {
  return (
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.VITE_LTA_DATAMALL_KEY ||
    process.env.VITE_LTA_ACCOUNT_KEY
  );
}

export async function fetchLiveBusArrivals(busStopCode = '04121', accountKey: string): Promise<any> {
  const url = `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${encodeURIComponent(busStopCode)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LTA DataMall BusArrival API responded with ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Web Fetch API export (Edge, Cloudflare, Next.js App Router)
export async function GET(request?: Request) {
  const accountKey = getLtaAccountKey();
  let busStopCode = '04121';

  if (request) {
    try {
      const url = new URL(request.url);
      busStopCode = url.searchParams.get('BusStopCode') || url.searchParams.get('busStopCode') || '04121';
    } catch {
      // Fallback
    }
  }

  if (!accountKey) {
    return new Response(
      JSON.stringify(
        {
          status: 'unconfigured',
          message:
            'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY or LTA_ACCOUNT_KEY environment variable.',
          endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
          headerRequired: 'AccountKey',
          busStopCode,
          timestamp: new Date().toISOString(),
          Services: [],
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  try {
    const data = await fetchLiveBusArrivals(busStopCode, accountKey);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15, s-maxage=15', // LTA buses refresh every ~20s
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Failed to fetch live bus arrival data from LTA DataMall',
        endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Serverless handler export (Node.js / Express / Vercel Serverless)
export default async function handler(req: any, res: any) {
  const accountKey = getLtaAccountKey();
  const busStopCode =
    (req?.query?.BusStopCode as string) ||
    (req?.query?.busStopCode as string) ||
    '04121';

  if (!accountKey) {
    const payload = {
      status: 'unconfigured',
      message:
        'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY or LTA_ACCOUNT_KEY environment variable.',
      endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
      headerRequired: 'AccountKey',
      busStopCode,
      timestamp: new Date().toISOString(),
      Services: [],
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(payload);
    }
    return GET();
  }

  try {
    const data = await fetchLiveBusArrivals(busStopCode, accountKey);

    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=15');
      return res.status(200).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errPayload = {
      status: 'error',
      message: error.message || 'Failed to fetch live bus arrival data from LTA DataMall',
      endpoint: `${LTA_BUS_ARRIVAL_API_URL}?BusStopCode=${busStopCode}`,
      timestamp: new Date().toISOString(),
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
