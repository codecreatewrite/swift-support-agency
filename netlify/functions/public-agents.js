const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function getAgents() {
  return new Promise((resolve, reject) => {
    const url = new URL(
      `${SUPABASE_URL}/rest/v1/agents?select=id,name,role,bio,photo_url&order=created_at.asc`
    );

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw || '[]')); }
        catch { resolve([]); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const agents = await getAgents();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(agents)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify([])
    };
  }
};
