const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Simple fetch wrapper using Node https
function supabase(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw || '[]') }); }
        catch { resolve({ status: res.statusCode, data: [] }); }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  // Auth check
  if (body.password !== ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {

    // GET all agents
    if (body.action === 'get') {
      const res = await supabase('GET', 'agents?select=*&order=created_at.asc', null);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(res.data)
      };
    }

    // SAVE agent (add or update)
    if (body.action === 'save') {
      const { id, name, role, bio, photo } = body.agent;

      if (!name || !role) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and role required' })
        };
      }

      let res;

      if (id) {
        // Update existing
        res = await supabase(
          'PATCH',
          `agents?id=eq.${id}`,
          { name, role, bio: bio || '', photo: photo || '' }
        );
      } else {
        // Insert new
        res = await supabase(
          'POST',
          'agents',
          { name, role, bio: bio || '', photo: photo || '' }
        );
      }

      // Fetch updated list
      const all = await supabase('GET', 'agents?select=*&order=created_at.asc', null);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, agents: all.data })
      };
    }

    // DELETE agent
    if (body.action === 'delete') {
      await supabase('DELETE', `agents?id=eq.${body.id}`, null);
      const all = await supabase('GET', 'agents?select=*&order=created_at.asc', null);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, agents: all.data })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Unknown action' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
