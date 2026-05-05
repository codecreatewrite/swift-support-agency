/* ===========================
   SWIFT SUPPORT AGENCY
   Main JavaScript
=========================== */

// --- Services Data ---
const SERVICES = [
  {
    icon: "fas fa-comments",
    title: "Live Chat Support",
    desc: "Real-time chat agents trained to resolve client issues instantly, keeping your users satisfied and engaged."
  },
  {
    icon: "fas fa-ticket",
    title: "Ticket Management",
    desc: "Systematic handling of support tickets ensuring nothing falls through the cracks and every issue gets resolved."
  },
  {
    icon: "fab fa-discord",
    title: "Discord Management",
    desc: "Professional moderation and community engagement on your Discord server, keeping your community active and healthy."
  },
  {
    icon: "fas fa-users",
    title: "Community Management",
    desc: "Building and nurturing your trading community across all platforms with consistent, on-brand communication."
  },
  {
    icon: "fas fa-user-shield",
    title: "Discord Manager",
    desc: "Dedicated Discord managers who handle roles, bots, channels, and member relations on your behalf."
  },
  {
    icon: "fas fa-server",
    title: "Backend Support",
    desc: "Operational and administrative support that keeps your platform running smoothly behind the scenes."
  },
  {
    icon: "fas fa-chart-bar",
    title: "CRM Management",
    desc: "Managing your customer relationships, data, and pipelines so no lead or client is ever neglected."
  },
  {
    icon: "fas fa-hashtag",
    title: "Social Media Management",
    desc: "Content creation, scheduling, and engagement across your social platforms to grow your online presence."
  },
  {
    icon: "fas fa-handshake",
    title: "Affiliate Management",
    desc: "Recruiting, onboarding, and managing affiliates who drive quality traffic and conversions to your platform."
  },
  {
    icon: "fas fa-headset",
    title: "Virtual Assistant",
    desc: "Dedicated virtual assistants handling administrative tasks, emails, scheduling, and day-to-day operations."
  }
];

// --- Render Services ---
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  grid.innerHTML = SERVICES.map(s => `
    <div class="service-card">
      <div class="service-card__icon">
        <i class="${s.icon}"></i>
      </div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');
}

// --- Render Agents ---
async function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;

  try {
    const res = await fetch('data/agents.json');
    const agents = await res.json();

    if (!agents || agents.length === 0) {
      grid.innerHTML = `
        <div class="agents__empty">
          <i class="fas fa-user-clock"></i>
          <h3>Agent Profiles Coming Soon</h3>
          <p>Our team profiles will be listed here shortly.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = agents.map(a => `
      <div class="agent-card">
        ${a.photo
          ? `<img src="${a.photo}" alt="${a.name}" class="agent-card__photo" />`
          : `<div class="agent-card__placeholder"><i class="fas fa-user"></i></div>`
        }
        <h3>${a.name}</h3>
        <div class="agent-card__role">${a.role}</div>
        <p>${a.bio}</p>
      </div>
    `).join('');

  } catch (err) {
    grid.innerHTML = `
      <div class="agents__empty">
        <i class="fas fa-user-clock"></i>
        <h3>Agent Profiles Coming Soon</h3>
        <p>Our team profiles will be listed here shortly.</p>
      </div>
    `;
  }
}

// --- Navbar Scroll Effect ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// --- Mobile Burger Menu ---
function initBurger() {
  const btn = document.getElementById('burgerBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

// --- Active Nav Link on Scroll ---
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// --- Scroll Reveal Animation ---
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.service-card, .agent-card, .about__feat-card, .contact__card'
  ).forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// --- Add reveal CSS dynamically ---
function injectRevealStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  injectRevealStyles();
  renderServices();
  renderAgents();
  initNavbar();
  initBurger();
  initActiveNav();

  // Small delay so cards exist before observer runs
  setTimeout(initReveal, 100);
});
