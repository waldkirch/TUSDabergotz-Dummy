/* =============================================================================
   TuS Dabergotz – Verhalten
   1. Navigation (Klick, Tastatur, Hover)
   2. Einblenden beim Scrollen, richtungsabhängig
   3. Scrollgesteuerte Effekte: Lesefortschritt, Parallaxe, Zeitstrahl
   Alles in einer requestAnimationFrame-Schleife, Listener passiv.
   ========================================================================== */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* ── 1 · Navigation ─────────────────────────────────────────────────── */

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('primary-menu');
  const header = document.getElementById('site-header');

  if (toggle && menu && header) {
    const label = toggle.querySelector('span');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let hoverTimer;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('hidden', !open);
      menu.classList.toggle('flex', open);
      label.textContent = open ? 'Menü schließen' : 'Menü öffnen';
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Das Menü klappt auch bei Hover auf, ohne den Klickweg zu ersetzen.
    toggle.addEventListener('mouseenter', () => {
      if (!canHover.matches || desktop.matches) return;
      clearTimeout(hoverTimer);
      setOpen(true);
    });
    header.addEventListener('mouseleave', () => {
      if (!canHover.matches || desktop.matches) return;
      hoverTimer = setTimeout(() => setOpen(false), 320);
    });
    menu.addEventListener('mouseenter', () => clearTimeout(hoverTimer));

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a') && !desktop.matches) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    desktop.addEventListener('change', () => setOpen(false));
  }

  /* ── 2 · Einblenden beim Scrollen ───────────────────────────────────── */

  const root = document.documentElement;
  const revealables = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      // beim Verlassen wieder ausblenden, damit der Effekt beim
      // Zurückscrollen erneut läuft
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { rootMargin: '-8% 0px -12% 0px', threshold: 0.12 });

    revealables.forEach((el) => observer.observe(el));
  }

  /* ── 3 · Scrollgesteuerte Effekte ───────────────────────────────────── */

  const progressBar = document.querySelector('[data-progress-bar]');
  const parallaxImages = Array.from(document.querySelectorAll('[data-parallax]'));
  const timeline = document.querySelector('[data-timeline]');
  const track = document.querySelector('[data-timeline-track]');
  const clipRect = document.querySelector('[data-timeline-clip]');
  const path = document.querySelector('[data-timeline-path]');
  const ball = document.querySelector('[data-timeline-ball]');
  const items = Array.from(document.querySelectorAll('[data-timeline-item]'));
  const pathLength = path ? path.getTotalLength() : 0;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;

    const y = window.scrollY;
    root.dataset.scrollDir = y > lastY ? 'down' : 'up';
    lastY = y;

    // Lesefortschritt unter der Kopfleiste
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    }

    if (reduced) return;

    // Bildbänder leicht versetzt mitlaufen lassen
    parallaxImages.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const relative = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = `translate3d(0, ${clamp(relative * -7, -7, 7)}%, 0)`;
    });

    // Zeitstrahl
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const span = rect.height + window.innerHeight * 0.55;
      const progress = clamp((window.innerHeight * 0.8 - rect.top) / span, 0, 1);

      timeline.style.setProperty('--progress', progress.toFixed(4));

      if (clipRect) clipRect.setAttribute('width', (1200 * progress).toFixed(1));

      items.forEach((item, index) => {
        item.classList.toggle('is-active', progress >= (index + 0.35) / items.length);
      });

      if (ball && track && pathLength && getComputedStyle(track).display !== 'none') {
        const point = path.getPointAtLength(pathLength * progress);
        const trackRect = track.getBoundingClientRect();
        const hostRect = timeline.getBoundingClientRect();
        const x = trackRect.left - hostRect.left + point.x * (trackRect.width / 1200);
        const yPos = trackRect.top - hostRect.top + point.y * (trackRect.height / 96);

        ball.style.opacity = progress > 0.01 && progress < 0.995 ? '1' : '0';
        ball.style.transform =
          `translate3d(${x - 18}px, ${yPos - 18}px, 0) rotate(${(progress * 1440).toFixed(1)}deg)`;
      }
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
