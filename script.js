/* ============================================================
   APEX DRIVE — Premium Car Rental Script
   ============================================================ */

'use strict';

// ── Utilities ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

// ── State ──────────────────────────────────────────────────
const state = {
  activeFilter: 'all',
  compareList: [],
  mobileNavOpen: false,
  locationSpinner: false,
};

/* ============================================================
   HEADER — scroll condensation
   ============================================================ */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;

  let lastScroll = 0;

  function updateHeader() {
    const scroll = window.scrollY;
    if (scroll > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scroll;
  }

  on(window, 'scroll', updateHeader, { passive: true });
  updateHeader();
}

/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const toggle = $('.mobile-menu-toggle');
  const nav = $('.mobile-nav');
  if (!toggle || !nav) return;

  const closeNav = () => {
    state.mobileNavOpen = false;
    nav.classList.remove('open');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    state.mobileNavOpen = true;
    nav.classList.add('open');
    toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  on(toggle, 'click', (e) => {
    e.stopPropagation();
    state.mobileNavOpen ? closeNav() : openNav();
  });

  // Close on outside click
  on(document, 'click', (e) => {
    if (state.mobileNavOpen && !toggle.contains(e.target) && !nav.contains(e.target)) {
      closeNav();
    }
  });

  // Close nav links and buttons
  $$('.mobile-nav-link, .btn', nav).forEach(el => {
    on(el, 'click', () => {
      closeNav();
    });
  });
}

/* ============================================================
   HERO — parallax + load animation
   ============================================================ */
function initHero() {
  const hero = $('.hero');
  const bg = $('.hero-bg');
  if (!hero) return;

  // Trigger load animation
  requestAnimationFrame(() => {
    hero.classList.add('loaded');
  });

  // Subtle parallax
  if (bg) {
    on(window, 'scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        bg.style.transform = `scale(1) translateY(${scrolled * 0.15}px)`;
      }
    }, { passive: true });
  }
}

/* ============================================================
   SEARCH MODULE
   ============================================================ */
function initSearch() {
  // Age toggle
  $$('.search-age-toggle').forEach(toggle => {
    const checkbox = $('input[type="checkbox"]', toggle);
    const ageGroup = toggle.nextElementSibling;
    if (!checkbox) return;

    on(checkbox, 'change', () => {
      if (ageGroup && ageGroup.classList.contains('form-group')) {
        ageGroup.style.display = checkbox.checked ? 'flex' : 'none';
        ageGroup.style.opacity = checkbox.checked ? '1' : '0';
      }
    });
  });

  // "Use my location" button
  $$('.location-btn').forEach(btn => {
    on(btn, 'click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation not supported', '⚠️');
        return;
      }
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Locating…`;
      btn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Location set`;
          btn.style.color = 'var(--success)';

          const locationInput = btn.closest('.form-group')?.querySelector('.form-control');
          if (locationInput) locationInput.value = 'Current Location';
        },
        () => {
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Try again`;
          btn.disabled = false;
        }
      );
    });
  });

  // Search form submit
  $$('.search-form').forEach(form => {
    on(form, 'submit', (e) => {
      e.preventDefault();
      const btn = $('[type="submit"]', form);
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Searching…`;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled = false;
        showToast('🚗 Loading available vehicles…');

        // Scroll to vehicles
        const vehicles = $('#vehicles');
        if (vehicles) vehicles.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1200);
    });
  });
}

/* ============================================================
   VEHICLE FILTER CHIPS
   ============================================================ */
function initFilterChips() {
  const chips = $$('.chip');

  chips.forEach(chip => {
    on(chip, 'click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.dataset.filter || 'all';
      filterVehicles(state.activeFilter);
    });
  });
}

function filterVehicles(filter) {
  const cards = $$('.vehicle-card[data-category]');

  cards.forEach((card, i) => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.style.transition = `opacity 0.3s ease ${i * 0.05}s, transform 0.3s ease ${i * 0.05}s`;
    if (show) {
      card.style.opacity = '1';
      card.style.transform = '';
      card.style.display = '';
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (state.activeFilter !== filter) return;
        card.style.display = filter === 'all' ? '' : 'none';
      }, 300);
    }
  });
}

/* ============================================================
   COMPARE SYSTEM
   ============================================================ */
function initCompare() {
  const tray = $('.compare-tray');
  const trayCount = $('.compare-tray-count');
  const trayText = $('.compare-tray-text');
  const trayClear = $('.compare-tray-clear');
  const trayBtn = $('.compare-tray-btn');

  function updateTray() {
    const n = state.compareList.length;
    if (trayCount) trayCount.textContent = n;
    if (trayText) trayText.textContent = n === 1 ? '1 car selected' : `${n} cars selected — Compare now`;
    if (tray) tray.classList.toggle('visible', n > 0);
  }

  $$('.vehicle-compare-btn').forEach(btn => {
    on(btn, 'click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.vehicle-card');
      const name = card?.querySelector('.vehicle-name')?.textContent;
      if (!name) return;

      const idx = state.compareList.indexOf(name);
      if (idx === -1) {
        if (state.compareList.length >= 3) {
          showToast('Max 3 cars can be compared', '⚠️');
          return;
        }
        state.compareList.push(name);
        btn.textContent = '✓ Added';
        btn.style.color = 'var(--teal-500)';
        btn.style.borderColor = 'rgba(14,207,200,0.3)';
      } else {
        state.compareList.splice(idx, 1);
        btn.textContent = 'Compare';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
      updateTray();
    });
  });

  if (trayClear) {
    on(trayClear, 'click', () => {
      state.compareList = [];
      $$('.vehicle-compare-btn').forEach(btn => {
        btn.textContent = 'Compare';
        btn.style.color = '';
        btn.style.borderColor = '';
      });
      updateTray();
    });
  }

  if (trayBtn) {
    on(trayBtn, 'click', () => {
      showToast(`Comparing: ${state.compareList.join(', ')}`);
    });
  }
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const trigger = $('.faq-trigger', item);
    if (!trigger) return;

    on(trigger, 'click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      $$('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const revealEls = $$('.reveal, .stagger');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function initCounters() {
  const counters = $$('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = el.dataset.decimals || 0;
      const duration = 1500;
      const start = performance.now();

      function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = (target * eased).toFixed(decimals);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   RATING BARS ANIMATION
   ============================================================ */
function initRatingBars() {
  const bars = $$('.bar-fill[data-width]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      setTimeout(() => {
        bar.style.width = bar.dataset.width;
      }, 200);
      observer.unobserve(bar);
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
}

/* ============================================================
   LOCATION ITEMS — hover interactions
   ============================================================ */
function initLocations() {
  $$('.location-item').forEach(item => {
    on(item, 'click', () => {
      const name = $('.location-name', item)?.textContent;
      if (name) {
        $$('.form-control[data-role="location"]').forEach(input => {
          input.value = name;
        });
        showToast(`📍 Location set to ${name}`);

        // Scroll to search
        const hero = $('.hero');
        if (hero) hero.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
let toastTimer;
function showToast(message, icon = '✓') {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;

  clearTimeout(toastTimer);
  toast.classList.remove('show');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================================
   SMOOTH SCROLL — nav anchors
   ============================================================ */
function initSmoothScroll() {
  $$('[data-scroll]').forEach(el => {
    on(el, 'click', (e) => {
      e.preventDefault();
      const target = $(el.dataset.scroll);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   "VIEW DETAILS" BUTTON
   ============================================================ */
function initVehicleDetails() {
  $$('.btn-view-details').forEach(btn => {
    on(btn, 'click', () => {
      const card = btn.closest('.vehicle-card');
      const name = $('.vehicle-name', card)?.textContent;
      const price = $('.price-per-day', card)?.textContent;
      showToast(`Opening ${name || 'vehicle'} details…`);
    });
  });
}

/* ============================================================
   MINI SEARCH (CTA band)
   ============================================================ */
function initMiniSearch() {
  const miniForm = $('.mini-search-form');
  if (!miniForm) return;

  on(miniForm, 'submit', (e) => {
    e.preventDefault();
    const input = $('input', miniForm);
    if (input?.value) {
      $$('.form-control[data-role="location"]').forEach(f => { f.value = input.value; });
    }
    const hero = $('.hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
    showToast('🔍 Search updated!');
  });
}

/* ============================================================
   NAV ACTIVE STATE
   ============================================================ */
function initNavActive() {
  const sections = $$('[data-section]');
  const navLinks = $$('.nav-link[data-scroll]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = `#${entry.target.id}`;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.scroll === id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   DATE DEFAULTS
   ============================================================ */
function initDateDefaults() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 3);
  const returnDate = new Date(today);
  returnDate.setDate(returnDate.getDate() + 6);

  const fmt = d => d.toISOString().split('T')[0];

  $$('input[type="date"][data-role="pickup-date"]').forEach(el => { el.value = fmt(tomorrow); el.min = fmt(today); });
  $$('input[type="date"][data-role="return-date"]').forEach(el => { el.value = fmt(returnDate); el.min = fmt(tomorrow); });

  // Link pickup → return minimum
  $$('input[type="date"][data-role="pickup-date"]').forEach(pickup => {
    on(pickup, 'change', () => {
      const returnEl = pickup.closest('form')?.querySelector('[data-role="return-date"]')
        || document.querySelector('[data-role="return-date"]');
      if (returnEl) {
        returnEl.min = pickup.value;
        if (returnEl.value && returnEl.value < pickup.value) returnEl.value = pickup.value;
      }
    });
  });
}

/* ============================================================
   SPIN ANIMATION (CSS keyframe injection)
   ============================================================ */
function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 1s linear infinite; }
    .loading-pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   CTA BUTTONS — "Check availability" scrolls to hero search
   ============================================================ */
function initCTAButtons() {
  $$('[data-action="check-availability"]').forEach(btn => {
    on(btn, 'click', () => {
      const search = $('.search-card');
      if (search) {
        search.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const firstInput = $('input, select', search);
          if (firstInput) firstInput.focus();
        }, 600);
      }
    });
  });

  $$('[data-action="browse-cars"]').forEach(btn => {
    on(btn, 'click', () => {
      const vehicles = $('#vehicles');
      if (vehicles) vehicles.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  injectKeyframes();
  initHeader();
  initMobileNav();
  initHero();
  initSearch();
  initFilterChips();
  initCompare();
  initFAQ();
  initScrollReveal();
  initCounters();
  initRatingBars();
  initLocations();
  initSmoothScroll();
  initVehicleDetails();
  initMiniSearch();
  initNavActive();
  initDateDefaults();
  initCTAButtons();
});
