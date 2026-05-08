const fs = require('fs');
const path = require('path');

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

  const { ADMIN_PASSWORD } = process.env;
  const body = JSON.parse(event.body || '{}');

  // Auth check
  if (body.password !== ADMIN_PASSWORD) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const agentsPath = path.join('/tmp', 'agents.json');

  // Load existing agents from /tmp or fallback empty
  let agents = [];
  try {
    const raw = fs.readFileSync(agentsPath, 'utf8');
    agents = JSON.parse(raw);
  } catch {
    agents = [];
  }

  // SAVE agent
  if (body.action === 'save') {
    const agent = body.agent;
    if (!agent || !agent.name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid agent data' })
      };
    }

    if (agent.id) {
      // Update existing
      const idx = agents.findIndex(a => a.id === agent.id);
      if (idx !== -1) agents[idx] = agent;
      else agents.push(agent);
    } else {
      // New agent
      agent.id = Date.now().toString();
      agents.push(agent);
    }

    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, agents })
    };
  }

  // DELETE agent
  if (body.action === 'delete') {
    agents = agents.filter(a => a.id !== body.id);
    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, agents })
    };
  }

  // GET agents
  if (event.httpMethod === 'GET' || body.action === 'get') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(agents)
    };
  }

  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: 'Unknown action' })
  };
};
