/**
 * RSS 2.0 Live Reading Feed Endpoint for Zapier
 * File: api/feed.js (in project root /api)
 * 
 * Route: GET /api/feed
 * Content-Type: application/rss+xml; charset=utf-8
 * Cache-Control: s-maxage=20, stale-while-revalidate=40
 */

import { getSimplifiedBusArrivals, getLtaAccountKey } from './bus.js';
import { getCarparksReading } from './carparks.js';

/**
 * Escapes &, <, and > in XML text fields
 */
function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Calculates current time in Singapore (UTC+8) rounded DOWN to the quarter hour,
 * matching RFC 822 and ISO quarter specifications.
 */
export function getSingaporeTime(date = new Date()) {
  const SG_OFFSET_MS = 8 * 60 * 60 * 1000;
  const sgTime = new Date(date.getTime() + SG_OFFSET_MS);

  const year = sgTime.getUTCFullYear();
  const month = sgTime.getUTCMonth(); // 0-11
  const day = sgTime.getUTCDate();
  const hours = sgTime.getUTCHours();
  const rawMinutes = sgTime.getUTCMinutes();
  const rawSeconds = sgTime.getUTCSeconds();

  // Round DOWN to nearest 15 minutes (:00, :15, :30, :45)
  const roundedMinutes = Math.floor(rawMinutes / 15) * 15;

  const pad = (n) => String(n).padStart(2, '0');

  // Format: 2026-11-11T14:15+08:00
  const isoQuarter = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(roundedMinutes)}+08:00`;
  const guid = `g2-park-${isoQuarter}`;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const roundedSgDate = new Date(Date.UTC(year, month, day, hours, roundedMinutes, 0));
  const roundedDayOfWeek = dayNames[roundedSgDate.getUTCDay()];
  // RFC 822 format: e.g. Wed, 11 Nov 2026 14:15:00 +0800
  const pubDate = `${roundedDayOfWeek}, ${day} ${monthNames[month]} ${year} ${pad(hours)}:${pad(roundedMinutes)}:00 +0800`;

  // lastBuildDate (exact reading timestamp)
  const currentDayOfWeek = dayNames[sgTime.getUTCDay()];
  const lastBuildDate = `${currentDayOfWeek}, ${day} ${monthNames[month]} ${year} ${pad(hours)}:${pad(rawMinutes)}:${pad(rawSeconds)} +0800`;

  // Singapore human readable time for plain text description
  const sgTimeString = `${day} ${monthNames[month]} ${year}, ${pad(hours)}:${pad(rawMinutes)}:${pad(rawSeconds)} SGT (UTC+8)`;

  return {
    isoQuarter,
    guid,
    pubDate,
    lastBuildDate,
    sgTimeString,
  };
}

/**
 * Builds the site's address from the incoming request's Host header.
 * Never fetches the site's own address.
 */
function getSiteBaseUrl(req) {
  let host = 'localhost:3000';
  let proto = 'https';

  if (req) {
    if (req.headers) {
      host = req.headers['x-forwarded-host'] || req.headers.host || host;
      proto =
        req.headers['x-forwarded-proto'] ||
        (req.secure ? 'https' : host.includes('localhost') ? 'http' : 'https');
    } else if (typeof req.url === 'string') {
      try {
        const u = new URL(req.url, 'http://localhost:3000');
        host = u.host || host;
        proto = u.protocol.replace(':', '') || proto;
      } catch (e) {
        // Fallback
      }
    }
  }

  return `${proto}://${host}`.replace(/\/+$/, '');
}

/**
 * Main feed generator returning XML string
 */
export async function generateRssFeed(req) {
  const accountKey = getLtaAccountKey();
  const timeInfo = getSingaporeTime();
  const siteUrl = getSiteBaseUrl(req);

  // Fetch data via shared services
  const [carparksResult, busResult] = await Promise.all([
    getCarparksReading(accountKey),
    getSimplifiedBusArrivals(accountKey),
  ]);

  // Check for failures or missing key
  let hasFailure = false;
  let failureSource = '';
  let failureStatus = 200;

  if (!accountKey) {
    hasFailure = true;
    failureSource = 'LTA DataMall';
    failureStatus = 401;
  } else if (!carparksResult.success) {
    hasFailure = true;
    failureSource = carparksResult.source || 'LTA CarParkAvailability';
    failureStatus = carparksResult.status || 500;
  } else if (!busResult.success) {
    hasFailure = true;
    failureSource = busResult.source || 'LTA BusArrival';
    failureStatus = busResult.status || 500;
  }

  // 1. Build Item Title
  let itemTitle = '';
  if (hasFailure) {
    // Requirement 6: "The item title then starts with 'Check failed:' and names the source and its HTTP status, so that the failure reaches my inbox."
    itemTitle = `Check failed: ${failureSource} ${failureStatus}`;
  } else {
    // Requirement 3: "the car park with the most lots free and its count, then the next bus at stop 04121, for example: Car park A 212 lots free, bus 7 in 4 min"
    const topCarpark = carparksResult.topCarpark;
    const earliestBus = busResult.earliestBus;
    itemTitle = `${topCarpark.name} ${topCarpark.availableLots} lots free, bus ${earliestBus.serviceNo} in ${earliestBus.arrivalMinutes} min`;
  }

  // 2. Build Item Description (Plain text, no HTML inside it)
  // "Every car park our screen shows with its lots free, then the next two buses for every service at stop 04121, then the time of the reading in Singapore time."
  const carparkLines = carparksResult.carparks
    .map((cp) => `${cp.name}: ${cp.availableLots} lots free`)
    .join('\n');

  const busLines = busResult.services
    .map((svc) => {
      const next1 = `${svc.nextMinutes} min`;
      const next2 =
        svc.next2Minutes !== null && svc.next2Minutes !== undefined
          ? `, ${svc.next2Minutes} min`
          : '';
      return `Bus ${svc.serviceNo}: ${next1}${next2}`;
    })
    .join('\n');

  let plainTextDescription = [
    hasFailure ? `Source Status: Check failed: ${failureSource} ${failureStatus}` : null,
    'Car Parks (Lots Free):',
    carparkLines,
    '',
    'Bus Stop 04121 Arrivals:',
    busLines,
    '',
    `Reading Time: ${timeInfo.sgTimeString}`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  // Item Link: site address with ?reading= and the same rounded quarter-hour time as the guid
  const itemLink = `${siteUrl}/?reading=${timeInfo.isoQuarter}`;
  const channelLink = siteUrl;

  // Construct RSS 2.0 XML
  const rssXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml('SMU Commute Advisor - Car Parks & Bus Stop 04121')}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml('Live car park lot availability near SMU campus and next bus arrivals for stop 04121.')}</description>
    <lastBuildDate>${escapeXml(timeInfo.lastBuildDate)}</lastBuildDate>
    <item>
      <title>${escapeXml(itemTitle)}</title>
      <description>${escapeXml(plainTextDescription)}</description>
      <link>${escapeXml(itemLink)}</link>
      <guid isPermaLink="false">${escapeXml(timeInfo.guid)}</guid>
      <pubDate>${escapeXml(timeInfo.pubDate)}</pubDate>
    </item>
  </channel>
</rss>`;

  return rssXml;
}

/**
 * Standard serverless / Express request handler
 */
export default async function handler(req, res) {
  try {
    const xml = await generateRssFeed(req);

    if (res && typeof res.status === 'function') {
      res.status(200);
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
      return res.send(xml);
    }

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=20, stale-while-revalidate=40',
      },
    });
  } catch (err) {
    // Fallback emergency RSS 2.0 if unexpected crash occurs
    const timeInfo = getSingaporeTime();
    const siteUrl = getSiteBaseUrl(req);
    const fallbackXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml('SMU Commute Advisor - Car Parks & Bus Stop 04121')}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml('Live car park lot availability near SMU campus and next bus arrivals for stop 04121.')}</description>
    <lastBuildDate>${escapeXml(timeInfo.lastBuildDate)}</lastBuildDate>
    <item>
      <title>${escapeXml('Check failed: Internal Server 500')}</title>
      <description>${escapeXml(`Check failed: Internal Server 500\n\nReading Time: ${timeInfo.sgTimeString}`)}</description>
      <link>${escapeXml(`${siteUrl}/?reading=${timeInfo.isoQuarter}`)}</link>
      <guid isPermaLink="false">${escapeXml(timeInfo.guid)}</guid>
      <pubDate>${escapeXml(timeInfo.pubDate)}</pubDate>
    </item>
  </channel>
</rss>`;

    if (res && typeof res.status === 'function') {
      res.status(200);
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
      return res.send(fallbackXml);
    }

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 's-maxage=20, stale-while-revalidate=40',
      },
    });
  }
}

export async function GET(request) {
  return handler(request);
}
