/* ================================================
   SWIFT SUPPORT AGENCY — Main JavaScript
================================================ */

// ---- Services Data ----
const SERVICES = [
  {
    icon: "fas fa-comments",
    title: "Live Chat Support",
    desc: "Your clients get answers fast. We provide trained agents who handle inquiries in real time, keeping response times low and satisfaction high."
  },
  {
    icon: "fas fa-ticket",
    title: "Ticket Management",
    desc: "Every support request tracked, assigned, and resolved. Nothing falls through the cracks — your clients always get a follow-through."
  },
  {
    icon: "fab fa-discord",
    title: "Discord Management",
    desc: "Active moderation, member engagement, and community health management — your Discord server stays organized and your community stays active."
  },
  {
    icon: "fas fa-users",
    title: "Community Management",
    desc: "Consistent, on-brand communication across your trading community. We keep your audience engaged and your platform's reputation strong."
  },
  {
    icon: "fas fa-handshake",
    title: "Affiliate Management",
    desc: "We recruit, onboard, and coordinate affiliates who drive quality traffic to your platform — so your growth engine keeps running."
  },
  {
    icon: "fas fa-headset",
    title: "Virtual Assistant",
    desc: "Dedicated remote support for scheduling, admin tasks, and day-to-day operations — so you stay focused on building your platform."
  }
];

// ---- Render Services ----
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  grid.innerHTML = SERVICES.map((s, i) => `
    <div class="service-card reveal" style="transition-delay: ${i * 60}ms">
      <div class="service-card__icon">
        <i class="${s.icon}"></i>
      </div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// ---- Render Agents ----
async function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/.netlify/functions/public-agents');
    const data = await res.json();
    const agents = Array.isArray(data) ? data : [];

    if (agents.length === 0) {
      grid.innerHTML = `
        <div class="agents__empty reveal">
          <i class="fas fa-user-tie"></i>
          <h3>Profiles Coming Soon</h3>
          <p>We're building our public talent directory. Reach out directly to discuss agent availability for your platform.</p>
          <a href="#contact" class="btn btn-outline agents__cta">Get In Touch</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = agents.map(a => `
      <div class="agent-card reveal">
        ${a.photo_url
          ? `<img src="${a.photo_url}" alt="${a.name}" class="agent-card__photo" />`
          : `<div class="agent-card__placeholder"><i class="fas fa-user"></i></div>`
        }

        <h3>${a.name}</h3>
        <div class="agent-card__role">${a.role}</div>
        <p>${a.bio || ''}</p>
      </div>
    `).join('');

  } catch (err) {
    console.error('Agents load error:', err);
    grid.innerHTML = `
      <div class="agents__empty reveal">
        <i class="fas fa-user-tie"></i>
        <h3>Profiles Coming Soon</h3>
        <p>We're building our public talent directory. Reach out directly to discuss agent availability for your platform.</p>
        <a href="#contact" class="btn btn-outline agents__cta">Get In Touch</a>
      </div>
    `;
  }
}

// ---- Navbar Scroll ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---- Burger Menu ----
function initBurger() {
  const btn   = document.getElementById('burgerBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      btn.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ---- Active Nav on Scroll ----
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const onScroll = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${current}`
      );
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---- Scroll Reveal ----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
}

// ---- FAQ Accordion ----
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        const a = i.querySelector('.faq__answer');
        if (a) a.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ---- Theme Toggle ----
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  btn.querySelector('i').className = saved === 'light' ? 'fas fa-moon' : 'fas fa-sun';

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.querySelector('i').className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderAgents();
  initNavbar();
  initBurger();
  initActiveNav();
  initFAQ();
  initTheme();
  setTimeout(initReveal, 120);
});
