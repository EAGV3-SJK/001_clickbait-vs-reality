// Guard: prevent re-registering listeners if script is injected multiple times
if (window.__cbvrLoaded) {
  // Already loaded — just trigger a fresh scan
  scanPage();
} else {
  window.__cbvrLoaded = true;
  init();
}

function init() {

const MIN_LENGTH = 20;
const MAX_HEADLINES = 30;
const SCANNED_ATTR = 'data-cbvr-scanned';

function findHeadlines() {
  const seen = new Set();
  const results = [];

  // Primary: heading tags containing links or standalone
  const selectors = [
    'h1 a', 'h2 a', 'h3 a',
    'h1', 'h2', 'h3',
    '[class*="headline"] a',
    '[class*="title"] a',
    '[class*="heading"] a',
    'article a',
    '[class*="story"] a',
    '[class*="card"] a'
  ];

  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      if (el.getAttribute(SCANNED_ATTR)) return;
      if (el.closest('nav, footer, header, aside, [role="navigation"]')) return;

      const text = el.innerText?.trim().replace(/\s+/g, ' ');
      if (!text || text.length < MIN_LENGTH || text.length > 300) return;
      if (seen.has(text)) return;

      // Skip obvious nav items
      if (['home', 'about', 'contact', 'login', 'sign up', 'subscribe'].includes(text.toLowerCase())) return;

      seen.add(text);
      results.push(el);
    });

    if (results.length >= MAX_HEADLINES) break;
  }

  return results.slice(0, MAX_HEADLINES);
}

function injectBadge(el, state = 'scanning', rating = '', reason = '') {
  // Avoid double-injecting
  const existing = el.parentElement?.querySelector('.cbvr-badge[data-for]');
  if (existing && existing.getAttribute('data-for') === el.innerText?.trim().slice(0, 30)) {
    return existing;
  }

  const badge = document.createElement('span');
  badge.className = 'cbvr-badge cbvr-scanning';
  badge.setAttribute('data-for', el.innerText?.trim().slice(0, 30));
  badge.textContent = '⏳';
  badge.title = 'Scanning…';

  // Insert inline after the element
  el.insertAdjacentElement('afterend', badge);
  el.setAttribute(SCANNED_ATTR, '1');
  return badge;
}

function updateBadge(badge, rating, reason) {
  const map = {
    honest:     { icon: '🟢', label: 'Honest',     cls: 'cbvr-honest'     },
    misleading: { icon: '🟡', label: 'Misleading', cls: 'cbvr-misleading' },
    clickbait:  { icon: '🔴', label: 'Clickbait',  cls: 'cbvr-clickbait'  }
  };
  const entry = map[rating] || map.honest;

  badge.className = `cbvr-badge ${entry.cls}`;
  badge.textContent = `${entry.icon} ${entry.label}`;
  badge.title = reason || '';
}

async function scanPage() {
  const elements = findHeadlines();
  if (elements.length === 0) return;

  // Inject scanning placeholders
  const badges = elements.map(el => injectBadge(el));
  const texts = elements.map(el => el.innerText.trim().replace(/\s+/g, ' '));

  chrome.runtime.sendMessage({ type: 'RATE_HEADLINES', headlines: texts }, (response) => {
    if (chrome.runtime.lastError || !response) {
      badges.forEach(b => {
        b.className = 'cbvr-badge cbvr-error';
        b.textContent = '⚠️';
        b.title = chrome.runtime.lastError?.message || 'Extension error';
      });
      return;
    }

    if (response.error) {
      badges.forEach(b => {
        b.className = 'cbvr-badge cbvr-error';
        b.textContent = '⚠️ Error';
        b.title = response.error;
      });
      return;
    }

    response.ratings.forEach((r, i) => {
      if (badges[i]) updateBadge(badges[i], r.rating, r.reason);
    });
  });
}

// Auto-scan pages that look like news (5+ headings)
function maybeAutoScan() {
  const headings = document.querySelectorAll('h1, h2, h3');
  if (headings.length >= 5) scanPage();
}

// Listen for manual scan trigger from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SCAN_PAGE') scanPage();
});

// Run after page settles
if (document.readyState === 'complete') {
  setTimeout(maybeAutoScan, 1500);
} else {
  window.addEventListener('load', () => setTimeout(maybeAutoScan, 1500));
}

} // end init()
