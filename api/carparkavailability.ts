/**
 * Serverless Carpark Availability Endpoint
 * Route: /api/carparkavailability
 * 
 * Pulls live carpark lots (HDB + LTA + URA) from LTA DataMall v2:
 * https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * 
 * Header: AccountKey: <Your LTA DataMall Key>
 */

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export function getLtaAccountKey(): string | undefined {
  return (
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.VITE_LTA_DATAMALL_KEY ||
    process.env.VITE_LTA_ACCOUNT_KEY
  );
}

export interface LtaCarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: number;
  LotType: string;
  Agency: string; // 'HDB' | 'URA' | 'LTA'
}

export async function fetchLiveCarparks(accountKey: string): Promise<any> {
  const response = await fetch(LTA_CARPARK_API_URL, {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LTA DataMall API responded with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Web Fetch API export (Edge, Cloudflare, Next.js App Router)
export async function GET(request?: Request) {
  const accountKey = getLtaAccountKey();

  if (!accountKey) {
    return new Response(
      JSON.stringify(
        {
          status: 'unconfigured',
          message:
            'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY or LTA_ACCOUNT_KEY environment variable.',
          endpoint: LTA_CARPARK_API_URL,
          headerRequired: 'AccountKey',
          timestamp: new Date().toISOString(),
          value: [],
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
    const data = await fetchLiveCarparks(accountKey);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30', // LTA data refreshed ~1 min
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'Failed to fetch live carpark data from LTA DataMall',
        endpoint: LTA_CARPARK_API_URL,
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

  if (!accountKey) {
    const responsePayload = {
      status: 'unconfigured',
      message:
        'LTA DataMall AccountKey is not configured. Please set the LTA_DATAMALL_KEY or LTA_ACCOUNT_KEY environment variable.',
      endpoint: LTA_CARPARK_API_URL,
      headerRequired: 'AccountKey',
      timestamp: new Date().toISOString(),
      value: [],
    };

    if (res && typeof res.status === 'function') {
      return res.status(200).json(responsePayload);
    }
    return GET();
  }

  try {
    const data = await fetchLiveCarparks(accountKey);

    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
      return res.status(200).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errPayload = {
      status: 'error',
      message: error.message || 'Failed to fetch live carpark data from LTA DataMall',
      endpoint: LTA_CARPARK_API_URL,
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
