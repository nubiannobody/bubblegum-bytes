import { getStore } from '@netlify/blobs';

// GET  /.netlify/functions/sync?code=bgb-sparkle-abc12   -> { entries: {...} }
// POST /.netlify/functions/sync  { code, entries }        -> { success: true }
export default async (req) => {
  const store = getStore('bubblegumbytes-entries');
  const url = new URL(req.url);

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === 'GET') {
    const code = url.searchParams.get('code');
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing sync code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const data = await store.get(code, { type: 'json' });
    return new Response(JSON.stringify({ entries: data || {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    const { code, entries } = body;
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing sync code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }

    await store.setJSON(code, entries || {});
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: cors });
};

export const config = {
  path: '/.netlify/functions/sync',
};