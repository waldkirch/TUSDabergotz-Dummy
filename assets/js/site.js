/* =============================================================================
   TuS Dabergotz – Verhalten
   1. Navigation (Klick, Tastatur, Hover)
   2. Aufklappbereiche: ganze Chronik samt Epochen, Kontaktformular
   3. Kontaktformular: Prüfung im Browser
   4. Einblenden beim Scrollen, richtungsabhängig
   5. Scrollgesteuerte Effekte: Lesefortschritt, Parallaxe, Zeitstrahl
   6. Fanshop: Produktfotos aus assets/js/shop-produkte.js nachtragen
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

    // Das Panel kennt zwei Zustände: per Hover geöffnet (flüchtig) und per
    // Klick festgehalten. Ohne diese Unterscheidung würde ein Klick das
    // Menü sofort wieder schließen, weil der Zeiger es vorher geöffnet hat.
    let pinned = false;
    let hoverTimer;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('hidden', !open);
      menu.classList.toggle('flex', open);
      label.textContent = open ? 'Menü schließen' : 'Menü öffnen';
    };

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => {
      if (isOpen() && pinned) {
        pinned = false;
        setOpen(false);
      } else {
        pinned = true;
        setOpen(true);
      }
    });

    // Hover öffnet das Panel, ein Klick hält es fest.
    toggle.addEventListener('mouseenter', () => {
      if (!canHover.matches || desktop.matches) return;
      clearTimeout(hoverTimer);
      setOpen(true);
    });

    header.addEventListener('mouseleave', () => {
      if (!canHover.matches || desktop.matches || pinned) return;
      hoverTimer = setTimeout(() => setOpen(false), 320);
    });

    menu.addEventListener('mouseenter', () => clearTimeout(hoverTimer));

    menu.addEventListener('click', (event) => {
      if (event.target.closest('a') && !desktop.matches) {
        pinned = false;
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        pinned = false;
        setOpen(false);
        toggle.focus();
      }
    });

    desktop.addEventListener('change', () => {
      pinned = false;
      setOpen(false);
    });
  }

  /* ── 2 · Aufklappbereiche ───────────────────────────────────────────────
     Ein Button mit data-disclosure="<id>" steuert den Bereich mit dieser id.
     Geschlossen bekommt der Bereich inert, damit er nicht per Tabulator
     erreichbar ist, obwohl er im DOM bleibt.
     --------------------------------------------------------------------- */

  const disclosures = new Map();

  const setDisclosure = (button, panel, open, { focus = false } = {}) => {
    button.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');

    const openLabel = button.dataset.labelOpen;
    const closeLabel = button.dataset.labelClose;
    const textNode = button.querySelector('[data-disclosure-label]');
    if (textNode && openLabel && closeLabel) {
      textNode.textContent = open ? closeLabel : openLabel;
    }

    if (open && focus) {
      const target = panel.querySelector('[data-disclosure-focus]');
      if (target) {
        window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
      }
    }
  };

  document.querySelectorAll('[data-disclosure]').forEach((button) => {
    const panel = document.getElementById(button.dataset.disclosure);
    if (!panel) return;

    disclosures.set(panel.id, { button, panel });
    setDisclosure(button, panel, panel.classList.contains('is-open'));

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      setDisclosure(button, panel, open, { focus: true });
      if (!open) button.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  });

  // Jeder Link auf #kontakt öffnet das Formular und springt hin.
  const openFromHash = (hash) => {
    const id = hash.replace('#', '');
    const entry = disclosures.get(id === 'kontakt' ? 'kontakt-formular' : id);
    if (entry) setDisclosure(entry.button, entry.panel, true);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => openFromHash(link.getAttribute('href')));
  });
  if (window.location.hash) openFromHash(window.location.hash);

  /* ── 3 · Kontaktformular ────────────────────────────────────────────────
     Reiner Browser-Check. Das Versenden übernimmt später WordPress
     (Contact Form 7, WPForms o. Ä.) oder ein eigener Endpunkt.
     --------------------------------------------------------------------- */

  const form = document.querySelector('[data-contact-form]');

  if (form) {
    const note = form.querySelector('[data-form-note]');

    const showError = (field, show) => {
      const wrapper = field.closest('[data-field]');
      if (wrapper) wrapper.toggleAttribute('data-invalid', show);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let firstInvalid = null;
      form.querySelectorAll('[data-field] input, [data-field] textarea').forEach((field) => {
        const invalid = !field.checkValidity();
        showError(field, invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      note.classList.add('is-visible');
      note.setAttribute('role', 'status');
    });

    form.querySelectorAll('[data-field] input, [data-field] textarea').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.checkValidity()) showError(field, false);
      });
    });
  }

  /* ── 3a · Trainerfotos ──────────────────────────────────────────────────
     Im Markup steht das Standardbild mit Vereinswappen. Liegt unter dem in
     data-photo genannten Pfad ein echtes Foto, wird es im Hintergrund geladen
     und erst nach erfolgreichem Laden eingesetzt. So sieht niemand ein
     kaputtes Bildsymbol, und ohne Foto bleibt es einfach beim Standardbild.
     --------------------------------------------------------------------- */

  document.querySelectorAll('img[data-photo]').forEach((img) => {
    const probe = new Image();
    probe.addEventListener('load', () => {
      img.src = probe.src;
      img.classList.remove('is-fallback');
    }, { once: true });
    probe.src = img.dataset.photo;
  });

  /* ── 3b · Fanshop: Produktfotos nachtragen ──────────────────────────────
     Namen und Links stehen im HTML. Ist in shop-produkte.js eine Bildadresse
     hinterlegt, ersetzt sie hier das Wappen-Standardbild.
     --------------------------------------------------------------------- */

  const shopImages = window.TUSD_SHOP_BILDER || {};

  document.querySelectorAll('[data-produkt]').forEach((figure) => {
    const url = shopImages[figure.dataset.produkt];
    if (!url) return;

    const img = figure.querySelector('img');
    if (!img) return;

    img.src = url;
    img.classList.remove('is-placeholder');
    img.classList.add('object-cover');
    // Bleibt die Adresse tot, fällt die Kachel auf das Wappen zurück.
    img.addEventListener('error', () => {
      img.src = 'assets/img/TUSDabergotz_Logo.svg';
      img.classList.add('is-placeholder');
      img.classList.remove('object-cover');
    }, { once: true });
  });

  /* ── 4 · Einblenden beim Scrollen ───────────────────────────────────── */

  const root = document.documentElement;
  const revealables = document.querySelectorAll('[data-reveal]');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { rootMargin: '-8% 0px -12% 0px', threshold: 0.12 });

    revealables.forEach((el) => observer.observe(el));
  }

  /* ── 5 · Scrollgesteuerte Effekte ───────────────────────────────────── */

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

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    }

    if (reduced) return;

    parallaxImages.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const relative = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = `translate3d(0, ${clamp(relative * -7, -7, 7)}%, 0)`;
    });

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
