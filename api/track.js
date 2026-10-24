// Vercel Serverless Function: GET /api/track
// Configure TRACK17_KEY in Vercel Project Settings > Environment Variables.
const ARTICLES = [
  { id: 'sed', div: 'SED', block: 'Block 12', who: 'Registrar, Student Evaluation Division', no: 'EY674400700IN' },
  { id: 'srd', div: 'SRD', block: 'Block 3', who: 'Registrar, Student Registration Division', no: 'EY674398966IN' },
  { id: 'rsd', div: 'RSD', block: '', who: 'Director, Regional Services Division', no: 'EY674402127IN' },
  { id: 'ssc', div: 'SSC', block: '', who: 'Director, Student Service Centre', no: 'EY674401400IN' },
];
const API = 'https://api.17track.net/track/v2.2';

async function t17(path, numbers, key) {
  const response = await fetch(API + path, {
    method: 'POST',
    headers: { '17token': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(numbers.map(number => ({ number }))),
  });
  if (!response.ok) throw new Error('17TRACK returned HTTP ' + response.status);
  return response.json();
}
async function liveStatus(key) {
  const numbers = ARTICLES.map(a => a.no);
  let info = await t17('/gettrackinfo', numbers, key);
  const rejectedNotRegistered = (info?.data?.rejected || [])
    .filter(x => x?.error?.code === -18019902)
    .map(x => x.number);
  if (rejectedNotRegistered.length) {
    await t17('/register', rejectedNotRegistered, key);
    info = await t17('/gettrackinfo', numbers, key);
  }
  const byNo = {};
  for (const x of info?.data?.accepted || []) byNo[x.number] = x;
  return ARTICLES.map(a => {
    const x = byNo[a.no], ti = x?.track_info, events = [];
    for (const p of ti?.tracking?.providers || []) {
      for (const e of p.events || []) events.push({
        time: e.time_iso || e.time_utc || '',
        text: e.description || '',
        place: e.location || '',
      });
    }
    events.sort((p, q) => String(q.time).localeCompare(String(p.time)));
    const latestRaw = ti?.latest_event;
    const latest = latestRaw ? {
      time: latestRaw.time_iso || latestRaw.time_utc || '',
      description: latestRaw.description || '',
      place: latestRaw.location || '',
    } : (events[0] || null);
    return {
      ...a,
      status: ti?.latest_status?.status || (x ? 'NotFound' : 'Waiting'),
      sub: ti?.latest_status?.sub_status || '',
      latest,
      events,
      pending: !x,
    };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const key = process.env.TRACK17_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'Missing TRACK17_KEY environment variable. Add it in Vercel Project Settings.',
      articles: ARTICLES.map(a => ({ ...a, status: 'Error', events: [], pending: true })),
    });
  }
  try {
    const articles = await liveStatus(key);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ updated: new Date().toISOString(), articles });
  } catch (error) {
    // Do not cache errors; expose a useful message without exposing the secret.
    return res.status(502).json({
      error: error && error.message ? error.message : 'Unable to fetch tracking data',
      articles: ARTICLES.map(a => ({ ...a, status: 'Error', events: [], pending: true })),
    });
  }
};
