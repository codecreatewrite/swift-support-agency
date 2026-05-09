/* ================================================
   SWIFT SUPPORT AGENCY — Admin Panel JS              
================================================ */

let SESSION_PASSWORD = '';
let currentAgents = [];

// ---- Login ----
async function login() {
  const pw = document.getElementById('passwordInput').value.trim();
  if (!pw) return;

  const btn = document.getElementById('loginBtn');
  const spinner = document.getElementById('loginSpinner');
  const error = document.getElementById('loginError');

  btn.disabled = true;
  spinner.style.display = 'block';
  error.style.display = 'none';

  try {
    const res = await fetch('/.netlify/functions/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, action: 'get' })
    });

    if (res.status === 401) {
      error.style.display = 'block';
      btn.disabled = false;
      spinner.style.display = 'none';
      return;
    }

    const agents = await res.json();
    SESSION_PASSWORD = pw;
    currentAgents = Array.isArray(agents) ? agents : [];

    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    renderAgents(currentAgents);

  } catch (err) {
    error.textContent = 'Connection error. Please try again.';
    error.style.display = 'block';
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

// Allow Enter key on password field
document.addEventListener('DOMContentLoaded', () => {
  const pw = document.getElementById('passwordInput');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
});

// ---- Logout ----
function logout() {
  SESSION_PASSWORD = '';
  currentAgents = [];
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('passwordInput').value = '';
}

// ---- Load Agents ----
async function loadAgents() {
  try {
    const res = await fetch('/.netlify/functions/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: SESSION_PASSWORD, action: 'get' })
    });
    const agents = await res.json();
    currentAgents = Array.isArray(agents) ? agents : [];
    renderAgents(currentAgents);
  } catch {
    showToast('Failed to load agents', 'error');
  }
}

// ---- Render Agents ----
function renderAgents(agents) {
  const grid = document.getElementById('agentsGrid');
  const count = document.getElementById('agentCount');

  count.textContent = agents.length ? `(${agents.length})` : '';

  if (!agents.length) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <i class="fas fa-user-slash"></i>
        <p>No agents added yet. Use the form above to add your first agent.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = agents.map(a => `
    <div class="agent-card">
      <div class="agent-card__top">
        ${a.photo_url
          ? `<img src="${a.photo_url}" class="agent-card__photo" alt="${a.name}" />`
          : `<div class="agent-card__placeholder"><i class="fas fa-user"></i></div>`
        }
        <div>
          <div class="agent-card__name">${a.name}</div>
          <div class="agent-card__role">${a.role}</div>
        </div>
      </div>
      ${a.bio ? `<div class="agent-card__bio">${a.bio}</div>` : ''}
      <div class="agent-card__actions">
        <button class="btn btn-outline btn-sm" onclick="editAgent('${a.id}')">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteAgent('${a.id}', '${a.name}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ---- Photo Preview (URL based) ----
function previewPhoto() {
  const url = document.getElementById('agentPhoto').value.trim();
  const preview = document.getElementById('photoPreview');
  if (!url) { preview.style.display = 'none'; return; }
  preview.src = url;
  preview.style.display = 'block';
}

// ---- Save Agent ----
async function saveAgent() {
  const name = document.getElementById('agentName').value.trim();
  const role = document.getElementById('agentRole').value.trim();
  const bio  = document.getElementById('agentBio').value.trim();
  const id   = document.getElementById('agentId').value;

  if (!name || !role) {
    showToast('Name and role are required', 'error');
    return;
  }

  const btn     = document.querySelector('[onclick="saveAgent()"]');
  const spinner = document.getElementById('saveSpinner');
  btn.disabled  = true;
  spinner.style.display = 'block';

  // Handle photo URL
  let photoUrl = document.getElementById('agentPhoto').value.trim();
  if (!photoUrl && id) {
    const existing = currentAgents.find(a => a.id === id);
    if (existing) photoUrl = existing.photo_url || '';
  }

  const agent = { name, role, bio, photo_url: photoUrl };
  if (id) agent.id = id;

  try {
    const res = await fetch('/.netlify/functions/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: SESSION_PASSWORD,
        action: 'save',
        agent
      })
    });

    const data = await res.json();

    if (data.success) {
      currentAgents = data.agents;
      renderAgents(currentAgents);
      resetForm();
      showToast(id ? 'Agent updated successfully' : 'Agent added successfully', 'success');
    } else {
      showToast('Failed to save agent', 'error');
    }

  } catch {
    showToast('Connection error', 'error');
  }

  btn.disabled = false;
  spinner.style.display = 'none';
}

// ---- Edit Agent ----
function editAgent(id) {
  const agent = currentAgents.find(a => a.id === id);
  if (!agent) return;

  document.getElementById('agentId').value   = agent.id;
  document.getElementById('agentName').value = agent.name;
  document.getElementById('agentRole').value = agent.role;
  document.getElementById('agentBio').value  = agent.bio || '';
  document.getElementById('agentPhoto').value = agent.photo_url || '';

  if (agent.photo_url) {
    const preview = document.getElementById('photoPreview');
    preview.src = agent.photo_url;
    preview.style.display = 'block';
  } else {
    document.getElementById('photoPreview').style.display = 'none';
  }

  document.getElementById('formTitle').textContent = 'Edit Agent';
  document.getElementById('saveLabel').textContent = 'Update Agent';
  document.getElementById('cancelBtn').style.display = 'inline-flex';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Delete Agent ----
async function deleteAgent(id, name) {
  if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

  try {
    const res = await fetch('/.netlify/functions/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: SESSION_PASSWORD,
        action: 'delete',
        id
      })
    });

    const data = await res.json();

    if (data.success) {
      currentAgents = data.agents;
      renderAgents(currentAgents);
      showToast(`${name} removed`, 'success');
    } else {
      showToast('Failed to delete agent', 'error');
    }

  } catch {
    showToast('Connection error', 'error');
  }
}

// ---- Reset Form ----
function resetForm() {
  document.getElementById('agentId').value   = '';
  document.getElementById('agentName').value = '';
  document.getElementById('agentRole').value = '';
  document.getElementById('agentBio').value  = '';
  document.getElementById('agentPhoto').value = '';

  const preview = document.getElementById('photoPreview');
  preview.src = '';
  preview.style.display = 'none';

  document.getElementById('formTitle').textContent = 'Add New Agent';
  document.getElementById('saveLabel').textContent = 'Save Agent';
  document.getElementById('cancelBtn').style.display = 'none';
}

// ---- Show Toast ----
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = toast.querySelector('i');
  document.getElementById('toastMsg').textContent = msg;

  toast.className = `toast ${type}`;
  icon.className  = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
