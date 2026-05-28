/* SHIELD Research Group — main.js */

// ── Data loading ──────────────────────────────────────────────────────────────

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function loadAll() {
  const [members, research, publications, projects] = await Promise.all([
    loadJSON('data/members.json'),
    loadJSON('data/research.json'),
    loadJSON('data/publications.json'),
    loadJSON('data/projects.json'),
  ]);
  return { members, research, publications, projects };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#1a3a5c','#2e7fb8','#27ae60','#8e44ad','#e67e22','#16a085','#c0392b','#2980b9'
];

function avatarColor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function avatarHTML(member, size = 80) {
  const cls = size === 80 ? 'card__avatar' : 'strip-item__avatar';
  if (member.photo) {
    return `<div class="${cls}">
      <img src="${member.photo}" alt="${member.name}" loading="lazy"
           onerror="this.parentElement.replaceWith(initialAvatarEl('${member.id}','${member.name}',${size}))">
    </div>`;
  }
  const bg = avatarColor(member.id);
  const ini = initials(member.name);
  if (size === 80) {
    return `<div class="avatar-initial" style="background:${bg}">${ini}</div>`;
  }
  return `<div class="strip-initial" style="background:${bg}">${ini}</div>`;
}

function initialAvatarEl(id, name, size) {
  const el = document.createElement('div');
  const cls = size === 80 ? 'avatar-initial' : 'strip-initial';
  el.className = cls;
  el.style.background = avatarColor(id);
  el.textContent = initials(name);
  return el;
}


function personChipHTML(member) {
  const bg = avatarColor(member.id);
  const ini = initials(member.name);
  const avatarEl = member.photo
    ? `<span class="person-chip__avatar"><img src="${member.photo}" alt="" loading="lazy"></span>`
    : `<span class="person-chip__initial" style="background:${bg}">${ini}</span>`;
  return `<a href="team.html#${member.id}" class="person-chip">${avatarEl}${member.name.split(' ')[0]}</a>`;
}

function iconSVG(name) {
  const icons = {
    'chart-line': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M4 20h16"/></svg>`,
    'search': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><circle cx="11" cy="11" r="8" stroke-width="2"/><path stroke-linecap="round" stroke-width="2" d="M21 21l-3.5-3.5"/></svg>`,
    'syringe': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-3 3m3-3l3 3M5 12h14"/></svg>`,
    'lightbulb': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707M12 21a6 6 0 006-6c0-2.21-1.197-4.131-3-5.197V8a3 3 0 00-6 0v1.803A6.001 6.001 0 006 15a6 6 0 006 6z"/></svg>`,
    'wifi': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>`,
    'clone': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  };
  return icons[name] || icons['chart-line'];
}

// ── Page: Home ────────────────────────────────────────────────────────────────

async function initHome() {
  const { members, research } = await loadAll();

  // Research tiles
  const tilesEl = document.getElementById('research-tiles');
  if (tilesEl) {
    tilesEl.innerHTML = research.map(t => `
      <a href="research.html#${t.id}" class="tile" style="--tile-color:${t.color}">
        <div class="tile__icon-wrap">
          <span class="tile__svg" style="color:${t.color};display:flex;align-items:center;justify-content:center;">
            ${iconSVG(t.icon)}
          </span>
        </div>
        <div class="tile__title">${t.title}</div>
        <div class="tile__sub">${t.subtitle}</div>
      </a>
    `).join('');
  }

  // Team strip
  const stripEl = document.getElementById('team-strip');
  if (stripEl) {
    stripEl.innerHTML = [...members].sort((a,b) => a.roleLevel - b.roleLevel).map(m => {
      const bg = avatarColor(m.id);
      const ini = initials(m.name);
      const avatarEl = m.photo
        ? `<div class="strip-item__avatar"><img src="${m.photo}" alt="${m.name}" loading="lazy"></div>`
        : `<div class="strip-initial" style="background:${bg}">${ini}</div>`;
      const firstName = m.name.split(' ')[0];
      return `<a href="team.html#${m.id}" class="strip-item">${avatarEl}<span class="strip-item__name">${firstName}</span></a>`;
    }).join('');
  }
}

// ── Page: Team ────────────────────────────────────────────────────────────────

const ROLE_LABEL = {
  1: { text: 'Principal Investigator', color: 'var(--navy)' },
  2: { text: 'Researcher',             color: 'var(--blue)' },
  3: { text: 'Postdoctoral Fellow',    color: '#16a085' },
  4: { text: 'PhD Student',            color: '#8e44ad' },
};

async function initTeam() {
  const members = await loadJSON('data/members.json');
  const container = document.getElementById('team-container');
  if (!container) return;

  const sorted = [...members].sort((a, b) => a.roleLevel - b.roleLevel);

  let html = '<div class="team-grid">';
  for (const m of sorted) {
    const rl = ROLE_LABEL[m.roleLevel];
    const avatar = avatarHTML(m, 80);
    const links = [
      m.email   ? `<a href="mailto:${m.email}">✉ Email</a>` : '',
      m.scholar ? `<a href="${m.scholar}" target="_blank" rel="noopener">Scholar</a>` : '',
      m.orcid   ? `<a href="${m.orcid}"   target="_blank" rel="noopener">ORCID</a>`   : '',
    ].filter(Boolean).join('');

    html += `<div class="card" id="${m.id}" style="border-top:4px solid ${rl.color}">
      ${avatar}
      <div class="card__name">${m.name}</div>
      <span class="card__role-badge" style="background:${rl.color}20;color:${rl.color}">${rl.text}</span>
      <div class="card__bio">${m.bio}</div>
      ${links ? `<div class="card__links">${links}</div>` : ''}
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Page: Research ────────────────────────────────────────────────────────────

async function initResearch() {
  const { research } = await loadAll();
  const container = document.getElementById('research-container');
  if (!container) return;

  container.innerHTML = research.map(t => {
    const iconEl = `<div class="research-icon" style="background:${t.color}1a;color:${t.color}">${iconSVG(t.icon)}</div>`;

    return `<div class="research-section" id="${t.id}">
      <div class="research-meta">
        ${iconEl}
        <h3 class="research-title">${t.title}</h3>
        <p class="research-subtitle">${t.subtitle}</p>
      </div>
      <div class="research-body"><p>${t.description}</p></div>
    </div>`;
  }).join('');

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Page: Publications ────────────────────────────────────────────────────────

async function initPublications() {
  const { members, research, publications } = await loadAll();
  const container = document.getElementById('pub-list');
  const scholarEl = document.getElementById('scholar-grid');
  if (!container) return;

  const researchMap = Object.fromEntries(research.map(r => [r.id, r]));

  function renderEntry(p) {
    let authorsHtml = p.authors;
    members.forEach(m => {
      const last = m.name.split(' ').slice(-1)[0];
      authorsHtml = authorsHtml.replace(new RegExp(last, 'g'), `<strong>${last}</strong>`);
    });
    const doiEl = p.doi
      ? `<a href="https://doi.org/${p.doi}" class="doi-link" target="_blank" rel="noopener">DOI</a>`
      : '';
    return `<div class="pub-entry">
      <div class="pub-title">${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</div>
      <div class="pub-authors">${authorsHtml}</div>
      <div class="pub-meta">
        <span class="pub-venue">${p.venue}</span>
        <span class="pub-year">${p.year}</span>
        ${doiEl}
      </div>
    </div>`;
  }

  // Group by topic, preserving research.json order
  let html = '';
  research.forEach(topic => {
    const topicPubs = publications.filter(p => p.topic === topic.id);
    if (!topicPubs.length) return;
    const iconEl = `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:${topic.color}1a;color:${topic.color};vertical-align:middle;margin-right:.5rem">${iconSVG(topic.icon)}</span>`;
    html += `<div class="pub-topic-section" id="pubs-${topic.id}">
      <h3 class="pub-topic-title" style="color:${topic.color}">${iconEl}${topic.title}</h3>
      <div class="pub-list-inner">${topicPubs.map(renderEntry).join('')}</div>
    </div>`;
  });
  container.innerHTML = html;

  // Scholar links
  if (scholarEl) {
    scholarEl.innerHTML = members
      .filter(m => m.scholar)
      .map(m => {
        const bg = avatarColor(m.id);
        const ini = initials(m.name);
        const avatarEl = m.photo
          ? `<span class="scholar-btn__avatar"><img src="${m.photo}" alt="" loading="lazy"></span>`
          : `<span class="scholar-btn__avatar" style="background:${bg};display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff">${ini}</span>`;
        return `<a href="${m.scholar}" class="scholar-btn" target="_blank" rel="noopener">${avatarEl}${m.name}</a>`;
      }).join('');
  }
}

// ── Page: Projects ────────────────────────────────────────────────────────────

async function initProjects() {
  const { members, projects } = await loadAll();
  const container = document.getElementById('projects-container');
  if (!container) return;

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]));

  container.innerHTML = projects.map(p => {
    const urlEl = p.url ? `<a href="${p.url}" class="btn btn--primary" target="_blank" rel="noopener" style="margin-top:.75rem;font-size:.82rem;padding:.4rem .9rem;">Website ↗</a>` : '';

    return `<div class="project-card">
      <div class="project-header">
        <div class="project-title">${p.title}</div>
        <span class="funder-badge funder-badge--${p.funderType}">${p.funder}</span>
      </div>
      <div class="project-period">${p.period}</div>
      <p class="project-desc">${p.description}</p>
      ${urlEl}
    </div>`;
  }).join('');
}

// ── Page: Industry ───────────────────────────────────────────────────────────

async function initIndustry() {
  const industry = await loadJSON('data/industry.json');
  const container = document.getElementById('industry-container');
  if (!container) return;

  container.innerHTML = industry.map(c => {
    const statusLabel = c.status === 'active' ? 'Active' : 'Past';
    return `<div class="collab-card collab-card--${c.status}">
      <div class="collab-header">
        <div>
          <div class="collab-company">${c.company}</div>
          <div class="collab-location">${c.location}</div>
        </div>
        <span class="status-badge status-badge--${c.status}">${statusLabel}</span>
      </div>
      <div class="collab-period">${c.period}</div>
      <p class="collab-summary">${c.summary}</p>
    </div>`;
  }).join('');
}

// ── Page: Contact ─────────────────────────────────────────────────────────────

async function initContact() {
  const { members } = await loadAll();
  const tableBody = document.getElementById('contact-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = [...members].sort((a,b) => a.roleLevel - b.roleLevel).map(m => {
    const emailEl = m.email
      ? `<a href="mailto:${m.email}">${m.email}</a>`
      : '<span class="text-muted">—</span>';
    return `<tr>
      <td>${m.name}</td>
      <td>${m.role}</td>
      <td>${emailEl}</td>
    </tr>`;
  }).join('');
}

// ── Mobile nav ────────────────────────────────────────────────────────────────

function initNav() {
  const hamburger = document.querySelector('.nav__hamburger');
  const links = document.querySelector('.nav__links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Mark active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const page = document.body.dataset.page;
  const inits = { home: initHome, team: initTeam, research: initResearch, publications: initPublications, projects: initProjects, industry: initIndustry, contact: initContact };
  if (inits[page]) inits[page]().catch(err => console.error('Page init error:', err));
});
