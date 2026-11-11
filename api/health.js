/**
 * Health Check Endpoint
 * File: api/health.js (in project root /api)
 */

import { getLtaAccountKey } from './bus.js';

export async function GET(request) {
  const accountKey = getLtaAccountKey();
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SMU Carpark & Bus Stop 04121 Commute API',
    ltaAccountKeyConfigured: Boolean(accountKey),
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'Service health check' },
      { path: '/api/bus', method: 'GET', description: 'Bus Stop 04121 arrivals' },
      { path: '/api/carparks', method: 'GET', description: 'SMU precinct carparks' },
      { path: '/api/feed', method: 'GET', description: 'RSS 2.0 feed for Zapier' },
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

export default async function handler(req, res) {
  const accountKey = getLtaAccountKey();
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SMU Carpark & Bus Stop 04121 Commute API',
    ltaAccountKeyConfigured: Boolean(accountKey),
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'Service health check' },
      { path: '/api/bus', method: 'GET', description: 'Bus Stop 04121 arrivals' },
      { path: '/api/carparks', method: 'GET', description: 'SMU precinct carparks' },
      { path: '/api/feed', method: 'GET', description: 'RSS 2.0 feed for Zapier' },
    ],
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }

  return GET();
}
