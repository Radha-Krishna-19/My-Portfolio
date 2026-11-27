// =========================================================
// P.M. Radha Krishna — Portfolio interactions
// GSAP + ScrollTrigger + Lenis (vendored in /vendor).
// Everything degrades gracefully: if the libraries fail to
// load, all content is shown without motion.
// =========================================================

// ===============================
// 1. EMAILJS CONFIG
// ===============================
const EMAILJS_PUBLIC_KEY  = 'NrykGPzBzy2VEHlce';
const EMAILJS_SERVICE_ID  = 'service_npgoouk';
const EMAILJS_TEMPLATE_ID = 'template_ndkivcy';

const HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const MOTION = HAS_GSAP && !REDUCED;

if (!MOTION) document.documentElement.classList.add('no-gsap');
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

let lenis = null;

// ===============================
// 2. HELPERS
// ===============================
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// Split an element's text into chars (wrapped per word so words never break).
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  const chars = [];
  text.split(/(\s+)/).forEach((part) => {
    if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
    const word = document.createElement('span');
    word.className = 'split-word';
    word.setAttribute('aria-hidden', 'true');
    for (const ch of part) {
      const c = document.createElement('span');
      c.className = 'split-char';
      c.textContent = ch;
      word.appendChild(c);
      chars.push(c);
    }
    el.appendChild(word);
  });
  return chars;
}

// Split into words, preserving inline elements like <em>.
function splitWords(el) {
  const words = [];
  const walk = (node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'split-word';
          w.textContent = part;
          frag.appendChild(w);
          words.push(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        walk(child);
      }
    });
  };
  walk(el);
  return words;
}

// Wrap a title so its chars can rise out of a mask.
function maskTitle(el) {
  const chars = splitChars(el);
  $$('.split-word', el).forEach((w) => w.classList.add('split-line'));
  return chars;
}

// ===============================
// 3. SMOOTH SCROLL (Lenis)
// ===============================
function initLenis() {
  if (!MOTION || typeof window.Lenis === 'undefined') return;
  lenis = new Lenis({ duration: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
}

function initAnchors() {
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });
}

// ===============================
// 4. LOADER + HERO INTRO
// ===============================
function runIntro() {
  const heroChars = $$('.hero-title [data-split]').flatMap((el) => maskTitle(el));
  $$('.hero-line .wipe').forEach((w) => w.remove());
  if (!MOTION) { document.documentElement.classList.add('intro-ready'); initHeroScroll(); return; }

  let seen = false;
  try { seen = sessionStorage.getItem('rk-intro') === '1'; sessionStorage.setItem('rk-intro', '1'); } catch (e) {}

  // Shared end state for the rest of the hero
  const prepHero = () => {
    gsap.set('.hero-fade', { y: 24, opacity: 0 });
    gsap.set('.hero-meta > span', { y: 14, opacity: 0 });
    gsap.set('.photo-inner', { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set('.photo-img', { scale: 1.25 });
    gsap.set('.float-card', { y: 30, opacity: 0 });
    gsap.set('.navbar', { opacity: 0 });
  };
  const revealHero = (tl, at, k = 1) => {
    tl.to('.photo-inner', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0 * k, ease: 'expo.inOut' }, at)
      .to('.photo-img', { scale: 1, duration: 1.4 * k, ease: 'expo.out' }, at)
      .to('.navbar', { opacity: 1, duration: 0.6 * k, ease: 'power2.out' }, at + 0.35 * k)
      .to('.hero-meta > span', { y: 0, opacity: 1, duration: 0.6 * k, stagger: 0.05, ease: 'expo.out' }, at + 0.3 * k)
      .to('.hero-fade', { y: 0, opacity: 1, duration: 0.8 * k, stagger: 0.06, ease: 'expo.out' }, at + 0.35 * k)
      .to('.float-card', { y: 0, opacity: 1, duration: 0.8 * k, stagger: 0.1, ease: 'back.out(1.6)' }, at + 0.5 * k);
  };
  const finish = () => { initHeroScroll(); ScrollTrigger.refresh(); };

  document.documentElement.classList.add('intro-ready');
  prepHero();

  // Return visits in the same session: no cinematic, just a quick settle
  if (seen) {
    gsap.set(heroChars, { opacity: 1 });
    const tl = gsap.timeline({ onComplete: finish });
    revealHero(tl, 0, 0.7);
    return;
  }

  // ---- Cinematic: RK. -> RADHA KRISHNA. -> words glide into the hero title ----
  const phone = window.innerWidth < 700;
  const k = phone ? 0.95 : 1.25;
  gsap.set(heroChars, { opacity: 0 });
  gsap.set('.hero-dot', { opacity: 0 });

  const stage = document.createElement('div');
  stage.className = 'intro';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="intro-bg"></div><div class="intro-name">' +
    '<span class="iw iw1">R<span class="ix"><span>ADHA</span></span></span>' +
    '<span class="iw iw2">K<span class="ix"><span>RISHNA</span></span><span class="idot">.</span></span></div>';
  document.body.appendChild(stage);
  const name = $('.intro-name', stage);
  const w1 = $('.iw1', stage), w2 = $('.iw2', stage);
  const xs = $$('.ix', stage);
  const widths = xs.map((x) => x.firstElementChild.getBoundingClientRect().width);
  gsap.set(xs, { width: 0 });
  gsap.set(w2, { marginLeft: 0 });
  gsap.set(name, { xPercent: -50, yPercent: -50, opacity: 0, y: 12 });

  const tl = gsap.timeline({ onComplete: () => { stage.remove(); finish(); } });
  // 1. RK. appears (softly: fade, rise and un-blur)
  gsap.set(name, { filter: 'blur(8px)', scale: 0.97 });
  tl.to(name, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6 * k, ease: 'power2.out' }, 0.05);
  // 2. expands into RADHA KRISHNA.
  const expandAt = 0.05 + 0.5 * k;
  tl.to(xs, { width: (i) => widths[i], duration: 0.6 * k, ease: 'power3.inOut' }, expandAt)
    .to(w2, { marginLeft: '0.28em', duration: 0.6 * k, ease: 'power3.inOut' }, expandAt)
    .set(name, { clearProps: 'filter' });
  // 3. each word glides into its line of the hero title (measured at that moment)
  const glideAt = expandAt + 0.6 * k + 0.2; // short hold on RADHA KRISHNA.
  const glideDur = 0.85 * k;
  tl.add(() => {
    const t1 = $('.hero-line-1 [data-split]').getBoundingClientRect();
    const l2 = $('.hero-line-2 [data-split]').getBoundingClientRect();
    const dot = $('.hero-dot').getBoundingClientRect();
    const t2 = { left: l2.left, top: l2.top, width: dot.right - l2.left };
    [[w1, t1], [w2, t2]].forEach(([w, t]) => {
      const r = w.getBoundingClientRect();
      // 2D transforms keep the text re-rendered sharp every frame (no blurry layer that snaps at the end)
      gsap.to(w, { x: t.left - r.left, y: t.top - r.top, scale: t.width / r.width, transformOrigin: '0 0',
        force3D: false, duration: glideDur, ease: 'power3.inOut' });
    });
  }, glideAt);
  tl.to($('.intro-bg', stage), { opacity: 0, duration: 0.7 * k, ease: 'power2.inOut' }, glideAt + 0.2 * k);
  revealHero(tl, glideAt + 0.15 * k, k);
  // 4. hand over to the real title (same pixels), with a tiny crossfade so nothing pops
  tl.set(heroChars, { opacity: 1 }, glideAt + glideDur - 0.02)
    .set('.hero-dot', { opacity: 1 }, glideAt + glideDur - 0.02)
    .to(name, { opacity: 0, duration: 0.12 }, glideAt + glideDur);

  // Any input skips straight to the end
  const skip = () => { if (tl.progress() < 1) tl.progress(1); };
  const cleanup = () => ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.removeEventListener(ev, skip));
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, skip, { passive: true }));
  tl.eventCallback('onComplete', () => { cleanup(); stage.remove(); finish(); });
}

// A soft light follows the cursor across the hero
function initSpotlight() {
  const hero = $('.hero');
  if (!hero || !FINE_POINTER) return;
  const x = gsap.quickTo(hero, '--hx', { duration: 0.9, ease: 'power3' });
  const y = gsap.quickTo(hero, '--hy', { duration: 0.9, ease: 'power3' });
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    x(((e.clientX - r.left) / r.width) * 100);
    y(((e.clientY - r.top) / r.height) * 100);
  });
}

// Letters of the name lift in a wave when the cursor passes over them
function initHeroWave() {
  if (!FINE_POINTER) return;
  $$('.hero-title .split-char').forEach((c) => {
    c.addEventListener('mouseenter', () => {
      gsap.fromTo(c, { yPercent: 0 }, { yPercent: -14, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: true });
      gsap.fromTo(c, { color: 'var(--accent)' }, { color: 'var(--text)', duration: 0.9, ease: 'power1.out' });
    });
  });
}

// Mono labels decode from random glyphs when they scroll into view
function initScramble() {
  if (!MOTION) return;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>_';
  $$('[data-scramble]').forEach((el) => {
    const final = el.textContent;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => {
        const obj = { p: 0 };
        gsap.to(obj, {
          p: 1, duration: 0.8, ease: 'none',
          onUpdate: () => {
            const n = Math.floor(obj.p * final.length);
            let out = final.slice(0, n);
            for (let i = n; i < final.length; i++) out += final[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
            el.textContent = out;
          },
          onComplete: () => { el.textContent = final; },
        });
      },
    });
  });
}

// Cards lean with scroll speed, then settle (follow-through)
function initVelocitySkew() {
  if (!MOTION) return;
  const cards = $$('.work-card');
  if (!cards.length) return;
  const skewTo = gsap.quickTo(cards, 'skewX', { duration: 0.6, ease: 'power3' });
  ScrollTrigger.create({
    trigger: '#work', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => skewTo(gsap.utils.clamp(-6, 6, self.getVelocity() / -400)),
    onLeave: () => skewTo(0), onLeaveBack: () => skewTo(0),
  });
}

// Footer wordmark letters rise one by one
function initFooterLetters() {
  const big = $('.footer-big');
  if (!big || !MOTION) return;
  const chars = splitChars(big);
  gsap.from(chars, {
    yPercent: 100, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.035,
    scrollTrigger: { trigger: '.site-footer', start: 'top 85%' },
  });
}

function startFloatCards() {
  gsap.to('.card-1', { y: -14, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.card-2', { y: 12, duration: 3.1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.4 });
}

// ===============================
// 5. HERO SCROLL PARALLAX + PHOTO TILT
// ===============================
function initHeroScroll() {
  if (!MOTION) return;

  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-line-1', { xPercent: -6, ease: 'none', scrollTrigger: st });
  gsap.to('.hero-line-2', { xPercent: 6, ease: 'none', scrollTrigger: st });
  gsap.to('.hero-left', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { ...st, end: '80% top' } });
  gsap.to('.hero-right', { y: -60, ease: 'none', scrollTrigger: st });
  return;

  const card = $('#photoCard');
  if (!card || !FINE_POINTER) return;
  const rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3' });
  const ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3' });
  gsap.set(card, { transformPerspective: 900 });
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx((0.5 - py) * 14);
    ry((px - 0.5) * 14);
    card.style.setProperty('--sx', `${px * 100}%`);
    card.style.setProperty('--sy', `${py * 100}%`);
  });
  card.addEventListener('mouseleave', () => { rx(0); ry(0); });
}

// ===============================
// 6. TYPED ROLES
// ===============================
function initTypedRoles() {
  const el = $('#typed');
  if (!el) return;
  const roles = ['CSE Undergraduate', 'ML & CV Engineer', 'Full-Stack Builder', 'Problem Solver'];
  if (REDUCED) { el.textContent = roles[0]; return; }

  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    el.textContent = word.slice(0, c);
    if (!deleting && c === word.length) { deleting = true; return setTimeout(tick, 1600); }
    if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
    setTimeout(tick, deleting ? 38 : 78);
  })();
}

// ===============================
// 7. MARQUEES (scroll-velocity reactive)
// ===============================
function initMarquees() {
  const groups = [
    { sel: '.marquee-a', dir: -1, speed: 60 },
    { sel: '.marquee-b', dir: 1, speed: 50 },
    { sel: '.contact-marquee', dir: -1, speed: 70 },
  ];

  groups.forEach(({ sel, dir, speed }) => {
    const wrap = $(sel);
    if (!wrap) return;
    const track = $('.marquee-track', wrap);
    // duplicate track for a seamless loop
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    wrap.appendChild(clone);

    if (!MOTION) return;

    const tracks = [track, clone];
    let x = 0;
    let boost = 0;
    const width = () => track.getBoundingClientRect().width;

    ScrollTrigger.create({
      trigger: wrap, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => { boost = gsap.utils.clamp(-8, 8, self.getVelocity() / 250); },
    });

    gsap.ticker.add((_, delta) => {
      const w = width();
      if (!w) return;
      boost *= 0.92;
      const v = (speed + Math.abs(boost) * 120) * (delta / 1000);
      x += v * dir * (boost < -0.3 ? -1 : 1);
      x = ((x % w) + w) % w;
      gsap.set(tracks, { x: -x });
    });
  });
}

// ===============================
// 8. STATEMENT WORD REVEAL
// ===============================
function initStatement() {
  const el = $('#statement');
  if (!el || !MOTION) return;
  const words = splitWords(el);
  gsap.set(words, { opacity: 0.12 });
  gsap.to(words, {
    opacity: 1, stagger: 0.12, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
}

// ===============================
// 9. SECTION TITLES + GENERIC REVEALS
// ===============================
function initTitles() {
  if (!MOTION) return;
  $$('[data-split-title]').forEach((title) => {
    const chars = maskTitle(title);
    gsap.from(chars, {
      yPercent: 105, duration: 0.8, ease: 'expo.out', stagger: { amount: 0.3 },
      scrollTrigger: { trigger: title, start: 'top 88%' },
    });
  });

  $$('.section-kicker').forEach((k) => {
    gsap.from(k, {
      x: -20, opacity: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: k, start: 'top 92%' },
    });
  });
}

function initReveals() {
  if (!MOTION) return;
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    onEnter: (batch) => batch.forEach((el, i) => {
      const side = (i % 2 ? 1 : -1) * 28;
      gsap.fromTo(el, { x: side, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'sine.out', delay: i * 0.07, overwrite: 'auto' });
      gsap.fromTo(el, { y: 56, rotate: side / 14 }, { y: 0, rotate: 0, duration: 0.9, ease: 'expo.out', delay: i * 0.07 });
    }),
  });
  gsap.set('[data-reveal]', { opacity: 0 });
}

// ===============================
// 10. STATS COUNTERS
// ===============================
function initCounters() {
  $$('[data-count]').forEach((el) => {
    if (el.closest('.stat-item')) return;
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (!MOTION) { el.textContent = target.toFixed(dec); return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = obj.v.toFixed(dec); },
    });
  });
}

// ===============================
// 11. HORIZONTAL WORK SCROLL
// ===============================
function initWork() {
  if (!MOTION) return;
  const track = $('#workTrack');
  const pin = $('.work-pin');
  const bar = $('#workProgress');
  if (!track || !pin) return;

  // Same motion language as the rest of the site:
  // visual panel wipes up (like the portrait), title rises letter by letter (like section titles),
  // details fade up in sequence, and the big number drifts gently with scroll.
  $$('.work-card.big', track).forEach((card) => {
    const visual = card.querySelector('.work-visual');
    const title = card.querySelector('.work-title');
    const chars = title ? maskTitle(title) : [];
    const rest = card.querySelectorAll('.project-status, .work-summary, .work-cols > div, .project-tags, .work-foot, .work-spec li');
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
    tl.fromTo(visual, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0)
      .from(chars, { yPercent: 105, duration: 0.8, ease: 'expo.out', stagger: { amount: 0.3 } }, 0.25)
      .from(rest, { y: 22, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 }, 0.45);
  });
}

// ===============================
// 11b. DUST — cards form out of particles left->right as they enter, and crumble
// into dust that blows away as they leave the top. Everything is a pure function
// of scroll progress, so scrolling back up replays it exactly in reverse.
// ===============================
function initDust(cards) {
  if (!cards.length) return;
  const fx = document.createElement('canvas');
  fx.className = 'dust-canvas';
  fx.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fx);
  const ctx = fx.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const size = () => { fx.width = innerWidth * DPR; fx.height = innerHeight * DPR; fx.style.width = innerWidth + 'px'; fx.style.height = innerHeight + 'px'; };
  size(); addEventListener('resize', size);

  // deterministic pseudo-random, so the effect replays identically in reverse
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // soft round sprites (dust specks) in a few tones
  const sprite = (rgb) => {
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const g = c.getContext('2d').createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.35, `rgba(${rgb},.75)`); g.addColorStop(1, `rgba(${rgb},0)`);
    const x = c.getContext('2d'); x.fillStyle = g; x.fillRect(0, 0, 16, 16); return c;
  };
  const SPRITES = [sprite('233,231,223'), sprite('160,160,170'), sprite('110,110,122'), sprite('198,239,78')];

  // smooth value noise: gives the eroding edge an organic, ragged shape instead of steps
  const makeNoise = (seed) => {
    const G = 9, v = []; for (let i = 0; i < G * G; i++) v.push(rnd(seed + i));
    return (u, w) => {
      const x = u * (G - 1), y = w * (G - 1), x0 = Math.floor(x), y0 = Math.floor(y), fx_ = x - x0, fy = y - y0;
      const at = (i, j) => v[Math.min(G - 1, j) * G + Math.min(G - 1, i)];
      const sx = fx_ * fx_ * (3 - 2 * fx_), sy = fy * fy * (3 - 2 * fy);
      const top = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx, bot = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx;
      return top * (1 - sy) + bot * sy;
    };
  };
  const thresholdAt = (noise, u, w, grain) => u * 0.74 + noise(u, w) * 0.18 + grain * 0.08;

  const fine = matchMedia('(min-width: 900px)').matches;
  const states = cards.map((card, ci) => {
    const r = card.getBoundingClientRect();
    const noise = makeNoise(ci * 977 + 13);
    const MW = 140, MH = Math.max(24, Math.min(220, Math.round(MW * r.height / r.width)));
    const mask = document.createElement('canvas'); mask.width = MW; mask.height = MH;
    const mctx = mask.getContext('2d');
    const img = mctx.createImageData(MW, MH);
    const pth = new Float32Array(MW * MH);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const k = y * MW + x; pth[k] = thresholdAt(noise, x / MW, y / MH, rnd(ci * 100000 + k));
    }
    const N = Math.round(Math.min(fine ? 1800 : 1100, (r.width * r.height) / (fine ? 160 : 140)));
    const parts = [];
    for (let i = 0; i < N; i++) {
      const k = ci * 50000 + i * 7, u = rnd(k), w = rnd(k + 1);
      const tone = rnd(k + 2);
      parts.push({ u, w, th: thresholdAt(noise, u, w, rnd(k + 3)),
        sz: 0.7 + rnd(k + 4) * 1.6, spd: 0.6 + rnd(k + 5) * 0.9, ang: -0.35 - rnd(k + 6) * 0.7,
        curl: (rnd(k + 8) - 0.5) * 2, ph: rnd(k + 9) * 6.28,
        s: tone < 0.05 ? 3 : tone < 0.35 ? 0 : tone < 0.7 ? 1 : 2 });
    }
    const st = { card, MW, MH, mctx, img, pth, parts, b: 0, d: 0, key: '' };
    ScrollTrigger.create({ trigger: card, start: 'top 98%', end: 'top 50%', scrub: true,
      onUpdate: (self) => { st.b = self.progress; }, onRefresh: (self) => { st.b = self.progress; } });
    ScrollTrigger.create({ trigger: card, start: 'top 28%', end: 'bottom 6%', scrub: true,
      onUpdate: (self) => { st.d = self.progress; }, onRefresh: (self) => { st.d = self.progress; } });
    return st;
  });

  const EDGE = 0.035, BUILD_SPAN = 0.2, DUST_SPAN = 0.38;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function updateMask(st) {
    const key = st.b.toFixed(3) + '|' + st.d.toFixed(3);
    if (key === st.key) return;
    st.key = key;
    const { img, pth } = st, data = img.data;
    // overshoot so the card is fully solid at the ends of each range
    const b = st.b * 1.08, d = st.d * 1.08 - 0.04;
    for (let k = 0; k < pth.length; k++) {
      const th = pth[k];
      const a = clamp01((b - th) / EDGE) * clamp01((th - d) / EDGE);
      data[k * 4 + 3] = a * 255;
    }
    st.mctx.putImageData(img, 0, 0);
    const url = `url(${st.mctx.canvas.toDataURL()})`;
    st.card.style.webkitMaskImage = url; st.card.style.maskImage = url;
  }

  function drawParticles(st) {
    const r = st.card.getBoundingClientRect();
    if (r.bottom < -300 || r.top > innerHeight + 80) return;
    const b = st.b * 1.08, d = st.d * 1.08 - 0.04;
    const building = st.b > 0 && st.b < 1, dusting = st.d > 0 && st.d < 1;
    if (!building && !dusting) return;
    for (const p of st.parts) {
      let t, dx, dy;
      if (building && b < p.th && b > p.th - BUILD_SPAN) {
        t = (p.th - b) / BUILD_SPAN;                     // 1 = far away, 0 = landed
        const e = t * t;
        dx = -Math.cos(p.ang) * 260 * p.spd * e + Math.sin(p.ph + t * 5) * 14 * p.curl * t;
        dy = -Math.sin(p.ang) * 120 * p.spd * e + Math.cos(p.ph + t * 4) * 10 * t;
      } else if (dusting && d >= p.th && d < p.th + DUST_SPAN) {
        t = (d - p.th) / DUST_SPAN;                      // 0 = just broke off, 1 = gone
        const e = Math.pow(t, 1.5);
        dx = Math.cos(p.ang) * 340 * p.spd * e + Math.sin(p.ph + t * 6) * 18 * p.curl * t;
        dy = Math.sin(p.ang) * 230 * p.spd * e + Math.cos(p.ph + t * 5) * 12 * t;
      } else continue;
      const alpha = Math.pow(1 - t, 1.4) * 0.85;
      if (alpha < 0.02) continue;
      const x = r.left + p.u * r.width + dx, y = r.top + p.w * r.height + dy;
      const sz = p.sz * (1 - t * 0.35) * 2.4;
      ctx.globalAlpha = alpha;
      ctx.drawImage(SPRITES[p.s], (x - sz / 2) * DPR, (y - sz / 2) * DPR, sz * DPR, sz * DPR);
    }
  }

  gsap.ticker.add(() => {
    ctx.clearRect(0, 0, fx.width, fx.height);
    for (const st of states) { updateMask(st); drawParticles(st); }
    ctx.globalAlpha = 1;
  });
  addEventListener('resize', () => ScrollTrigger.refresh());
}

// ===============================
// 12. SKILL LEVEL BARS
// ===============================
function initSkillBars() {
  $$('.skill-level').forEach((wrap) => {
    const level = parseInt(wrap.dataset.level || '0', 10);
    wrap.setAttribute('aria-label', `${level} out of 5`);
    for (let i = 0; i < 5; i++) {
      const pip = document.createElement('i');
      if (i < level) pip.className = 'filled';
      wrap.appendChild(pip);
    }
  });
  if (!MOTION) return;
  $$('.skill-category').forEach((cat) => {
    gsap.from($$('.skill-level i.filled', cat), {
      scaleX: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05,
      scrollTrigger: { trigger: cat, start: 'top 80%' },
    });
  });
}

// ===============================
// 13. TIMELINE DRAW
// ===============================
function initTimeline() {
  const fill = $('#timelineFill');
  if (!fill || !MOTION) return;
  gsap.to(fill, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '#timeline', start: 'top 70%', end: 'bottom 60%', scrub: true },
  });
  $$('.timeline-dot').forEach((dot) => {
    gsap.from(dot, {
      scale: 0, duration: 0.7, ease: 'back.out(3)',
      scrollTrigger: { trigger: dot, start: 'top 72%' },
    });
  });
}

// ===============================
// 14. FOOTER WORDMARK
// ===============================
function initFooter() {
  if (!MOTION) return;
  initFooterLetters();
}

// ===============================
// 15. CURSOR, MAGNETIC, TILT, SPOTLIGHT
// ===============================
function initCursor() {
  if (!FINE_POINTER || !MOTION) return;
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  document.body.classList.add('has-cursor');

  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

  window.addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });

  const setState = (state) => {
    document.body.classList.toggle('cursor-link', state === 'link');
    document.body.classList.toggle('cursor-view', state === 'view');
  };
  document.addEventListener('mouseover', (e) => {
    const v = e.target.closest('[data-cursor="view"]');
    const l = e.target.closest('a, button, [data-cursor="link"], input, textarea');
    if (v && !e.target.closest('a')) setState('view');
    else if (l) setState('link');
    else setState(null);
  });
  document.addEventListener('mouseleave', () => { gsap.to([dot, ring], { opacity: 0, duration: 0.2 }); });
  document.addEventListener('mouseenter', () => { gsap.to([dot, ring], { opacity: 1, duration: 0.2 }); });
}

function initMagnetic() {
  if (!FINE_POINTER || !MOTION) return;
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.18);
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}

function initTilt() {
  if (!FINE_POINTER || !MOTION) return;
  $$('.tilt').forEach((el) => {
    gsap.set(el, { transformPerspective: 1000 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 7);
      ry((px - 0.5) * 7);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('mouseleave', () => { rx(0); ry(0); });
  });
}

// ===============================
// 16. NAVBAR: scrolled state, hide on scroll down, active link, progress
// ===============================
function initNavbar() {
  const nav = $('#navbar');
  const bar = $('#scroll-progress');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    const menuOpen = $('#navMenu').classList.contains('active');
    nav.classList.toggle('hidden', !menuOpen && y > lastY && y > 400);
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('.nav-menu a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id === 'projects' ? 'work' : entry.target.id === 'github' ? 'skills' : entry.target.id;
      links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => io.observe(s));
}

// ===============================
// 17. MOBILE MENU
// ===============================
function closeMenu() {
  const h = $('#hamburger');
  const m = $('#navMenu');
  if (!h || !m) return;
  h.classList.remove('active');
  m.classList.remove('active');
  if (lenis) lenis.start();
}

function initMobileMenu() {
  const h = $('#hamburger');
  const m = $('#navMenu');
  if (!h || !m) return;
  h.addEventListener('click', () => {
    const open = !m.classList.contains('active');
    h.classList.toggle('active', open);
    m.classList.toggle('active', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && MOTION) {
      gsap.fromTo($$('a', m), { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'expo.out', delay: 0.15 });
    }
  });
}

// ===============================
// 18. PROJECT FILTERING
// ===============================
function initProjectFilter() {
  const buttons = $$('.filter-btn');
  const cards = $$('.mini-card[data-category]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      const show = cards.filter((c) => f === 'all' || c.dataset.category === f);
      cards.forEach((c) => c.classList.toggle('is-hidden', !show.includes(c)));
      if (MOTION) {
        gsap.fromTo(show, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, overwrite: true });
      }
      if (HAS_GSAP) ScrollTrigger.refresh();
    });
  });
}


// ===============================
// 18b. PROJECT DETAIL — grows out of the clicked card (origin awareness)
// ===============================
function initDetail() {
  const panel = $('#detail');
  const scrim = $('#detailScrim');
  const content = $('#detailContent');
  const closeBtn = $('#detailClose');
  if (!panel || !content) return;

  let source = null;
  let tl = null;

  const targetRect = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(760, vw - 32);
    // measure the content at the final width so the panel hugs it
    const prev = panel.getAttribute('style') || '';
    panel.style.cssText = `left:-9999px;top:0;width:${w}px;height:auto;visibility:hidden`;
    const natural = content.scrollHeight;
    panel.setAttribute('style', prev);
    const h = Math.min(vh - 32, natural);
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  };
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };

  function open(card) {
    if (tl) tl.kill();
    source = card;
    content.innerHTML = '';
    content.appendChild(card.querySelector('.work-visual').cloneNode(true));
    content.appendChild(card.querySelector('.work-body').cloneNode(true));
    const title = content.querySelector('h3');
    if (title) title.id = 'detailTitle';

    panel.hidden = false; scrim.hidden = false;
    document.body.classList.remove('cursor-view');
    if (lenis) lenis.stop();
    const from = rectOf(card);
    const to = targetRect();

    if (!MOTION) { Object.assign(panel.style, px(to)); closeBtn.focus(); return; }

    gsap.set(panel, { ...px(from), borderRadius: 28 });
    gsap.set(content, { opacity: 0 });
    tl = gsap.timeline()
      .fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
      // anticipation: source card dips before the panel launches
      .to(card, { scale: 0.97, duration: 0.12, ease: 'power2.out' }, 0)
      .to(panel, { ...px(to), duration: 0.55, ease: 'expo.inOut' }, 0.08)
      .to(content, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.4)
      .fromTo(content.querySelectorAll('.work-spec li, .work-body > *'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', stagger: 0.035 }, 0.42)
      .set(card, { scale: 1 })
      .add(() => closeBtn.focus());
  }

  function close() {
    if (panel.hidden) return;
    if (tl) tl.kill();
    const done = () => {
      panel.hidden = true; scrim.hidden = true; content.innerHTML = '';
      if (lenis) lenis.start();
      if (source) source.focus({ preventScroll: true });
    };
    if (!MOTION || !source) return done();
    const to = rectOf(source);
    tl = gsap.timeline({ onComplete: done })
      .to(content, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0)
      .to(panel, { ...px(to), duration: 0.45, ease: 'expo.inOut' }, 0.05)
      .to(scrim, { opacity: 0, duration: 0.3 }, 0.15);
  }

  function px(r) { return { left: r.left, top: r.top, width: r.width, height: r.height }; }

  $$('.work-card:not(.work-end)').forEach((card) => {
    card.addEventListener('click', (e) => { if (!e.target.closest('a')) open(card); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); } });
  });
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (!panel.hidden) gsap.set(panel, px(targetRect())); });
}


// ===============================
// v6. ODOMETER STATS — each digit rolls into place like a counter wheel
// ===============================
function initOdometers() {
  const els = $$('.stat-item [data-count]');
  els.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const text = target.toFixed(parseInt(el.dataset.decimals || '0', 10));
    if (!MOTION) { el.textContent = text; return; }
    el.textContent = '';
    el.classList.add('odo');
    el.setAttribute('aria-label', text);
    const cols = [];
    for (const ch of text) {
      if (!/\d/.test(ch)) { const s = document.createElement('span'); s.className = 'odo-sep'; s.textContent = ch; el.appendChild(s); continue; }
      const col = document.createElement('span'); col.className = 'odo-col'; col.setAttribute('aria-hidden', 'true');
      const sizer = document.createElement('span'); sizer.className = 'odo-sizer'; sizer.textContent = ch; col.appendChild(sizer);
      const strip = document.createElement('span'); strip.className = 'odo-strip';
      // two full turns then the digit, so it visibly spins
      for (let k = 0; k < 20 + Number(ch) + 1; k++) { const d = document.createElement('span'); d.textContent = k % 10; strip.appendChild(d); }
      col.appendChild(strip); el.appendChild(col); cols.push({ strip, steps: 20 + Number(ch) });
    }
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => cols.forEach(({ strip, steps }, i) => {
        gsap.fromTo(strip, { yPercent: 0 }, { yPercent: -(steps / (steps + 1)) * 100, duration: 1.6 + i * 0.15, ease: 'power4.out' });
      }),
    });
  });
}

// ===============================
// v6. STACKED CARDS — skill groups pin and stack; the one underneath sinks back
// ===============================
function initStack() {
  const cards = $$('#skills .skill-category');
  if (!cards.length) return;
  $('#skills .skills-grid').classList.add('stack');
  cards.forEach((c, i) => c.style.setProperty('--i', i));
  if (!MOTION) return;
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.93, filter: 'brightness(0.55)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 20%', scrub: true },
    });
  });
}

// ===============================
// v6. HIGHLIGHTER — key phrases get a marker swipe as you read them
// ===============================
function initHighlights() {
  $$('.hl').forEach((el) => {
    if (!MOTION) { el.classList.add('on'); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 78%', once: true, onEnter: () => el.classList.add('on') });
  });
}


// ===============================
// THEME — dark / light, switched with an ink splash that spreads from the button
// ===============================
function initTheme() {
  const btn = $('#themeToggle');
  if (!btn) return;
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const label = () => {
    const light = root.dataset.theme === 'light';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    if (meta) meta.setAttribute('content', light ? '#f1eee6' : '#08080b');
  };
  const apply = (light) => {
    if (light) root.dataset.theme = 'light'; else delete root.dataset.theme;
    try { localStorage.setItem('rk-theme', light ? 'light' : 'dark'); } catch (e) { /* storage unavailable */ }
    label();
  };
  label();
  // fetch the ink animation quietly after the page has loaded, so the first click is instant
  const prefetch = () => ['assets/ink-flow-land.webp', 'assets/ink-flow-port.webp'].forEach((src) => { const i = new Image(); i.src = src; });
  if (document.readyState === 'complete') setTimeout(prefetch, 1500); else addEventListener('load', () => setTimeout(prefetch, 1500));
  btn.addEventListener('click', (e) => {
    const toLight = root.dataset.theme !== 'light';
    const r = btn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    root.style.setProperty('--vx', x + 'px');
    root.style.setProperty('--vy', y + 'px');
    if (!document.startViewTransition || REDUCED) { apply(toLight); return; }
    document.startViewTransition(() => apply(toLight));
  });
}

// ===============================
// PAGE LIGHT — a soft light behind the content that follows the cursor everywhere
// ===============================
function initPageLight() {
  const layer = $('.page-light');
  if (!layer || !FINE_POINTER || REDUCED) return;
  const pos = { x: innerWidth * 0.7, y: innerHeight * 0.3 };
  const setX = HAS_GSAP ? gsap.quickTo(pos, 'x', { duration: 0.8, ease: 'power3' }) : (v) => { pos.x = v; };
  const setY = HAS_GSAP ? gsap.quickTo(pos, 'y', { duration: 0.8, ease: 'power3' }) : (v) => { pos.y = v; };
  addEventListener('mousemove', (e) => { setX(e.clientX); setY(e.clientY); }, { passive: true });
  const paint = () => { layer.style.setProperty('--lx', pos.x + 'px'); layer.style.setProperty('--ly', pos.y + 'px'); };
  if (HAS_GSAP) gsap.ticker.add(paint); else addEventListener('mousemove', paint, { passive: true });
}

// ===============================
// 19. CONTACT FORM (EMAILJS)
// ===============================
function initContactForm() {
  const form = $('#contact-form');
  const successMsg = $('#successMsg');
  if (!form) return;

  if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof emailjs === 'undefined') {
      alert('EmailJS not loaded. Please email directly: pradhakrishna594@gmail.com');
      return;
    }
    const btn = form.querySelector('button[type="submit"] .roll > span');
    const original = btn ? btn.textContent : '';
    const submit = form.querySelector('button[type="submit"]');
    if (btn) btn.textContent = 'Sending...';
    if (submit) submit.disabled = true;

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        if (successMsg) successMsg.classList.add('show');
        form.reset();
        setTimeout(() => successMsg && successMsg.classList.remove('show'), 5000);
      })
      .catch((err) => {
        alert('Form failed. Please email directly: pradhakrishna594@gmail.com');
        console.error('EmailJS error:', err);
      })
      .finally(() => {
        if (btn) btn.textContent = original;
        if (submit) submit.disabled = false;
      });
  });
}

// ===============================
// 20. INIT
// ===============================
function init() {
  // Always start at the top: the intro plays there, and restoring an old scroll
  // position mid-setup confuses the scroll engine.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  if (HAS_GSAP) ScrollTrigger.clearScrollMemory && ScrollTrigger.clearScrollMemory('manual');
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initLenis();
  initAnchors();
  initNavbar();
  initMobileMenu();
  initTypedRoles();
  initSkillBars();
  initMarquees();
  initStatement();
  initTitles();
  initReveals();
  initCounters();
  initOdometers();
  initHighlights();
  initWork();
  initTimeline();
  initFooter();
  initMagnetic();
  initProjectFilter();
  initTheme();
  initPageLight();
  initContactForm();

  const start = () => runIntro();
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 350))]).then(start);
  } else {
    start();
  }

  window.addEventListener('load', () => { if (HAS_GSAP) ScrollTrigger.refresh(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

// v24 — sliding glass highlight in the nav (desktop)
(function initNavGlow() {
  const menu = document.getElementById('navMenu');
  if (!menu || !window.matchMedia('(min-width: 901px)').matches) return;
  const glow = document.createElement('span');
  glow.className = 'nav-glow'; glow.setAttribute('aria-hidden', 'true');
  menu.prepend(glow);
  const links = menu.querySelectorAll('a');
  const moveTo = (a) => {
    if (!a) { glow.classList.remove('on'); return; }
    glow.style.width = a.offsetWidth + 'px';
    glow.style.transform = `translateX(${a.offsetLeft}px)`;
    glow.classList.add('on');
  };
  const active = () => menu.querySelector('a.active');
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => moveTo(a));
    a.addEventListener('focus', () => moveTo(a));
  });
  menu.addEventListener('mouseleave', () => moveTo(active()));
  const mo = new MutationObserver(() => { if (!menu.matches(':hover')) moveTo(active()); });
  links.forEach((a) => mo.observe(a, { attributes: true, attributeFilter: ['class'] }));
  window.addEventListener('resize', () => moveTo(active()));
})();


// Nav logo: RK. expands to RADHA KRISHNA. on hover (only where there is room)
(function initLogoExpand() {
  const logo = document.querySelector('.logo');
  const mark = document.querySelector('.logo-mark');
  if (!mark) return;
  mark.innerHTML = 'R<span class="lx"><span>ADHA</span></span><span class="lk">K</span><span class="lx"><span>RISHNA</span></span><span class="logo-dot">.</span>';
  if (typeof gsap === 'undefined') return;
  const mq = window.matchMedia('(min-width: 1280px) and (hover: hover)');
  const xs = mark.querySelectorAll('.lx');
  const inner = mark.querySelectorAll('.lx > span');
  const lk = mark.querySelector('.lk');
  const widths = () => [...inner].map((s) => s.scrollWidth);
  gsap.set(xs, { width: 0 }); gsap.set(inner, { opacity: 0 });
  const open = () => {
    if (!mq.matches) return;
    const w = widths();
    gsap.to(xs, { width: (i) => w[i], duration: 0.7, ease: 'power3.out', overwrite: true });
    gsap.to(inner, { opacity: 1, duration: 0.45, delay: 0.08, ease: 'power1.out', overwrite: true });
    gsap.to(lk, { marginLeft: '0.28em', duration: 0.7, ease: 'power3.out', overwrite: true });
  };
  const close = () => {
    gsap.to(xs, { width: 0, duration: 0.55, ease: 'power3.inOut', overwrite: true });
    gsap.to(inner, { opacity: 0, duration: 0.3, ease: 'power1.in', overwrite: true });
    gsap.to(lk, { marginLeft: 0, duration: 0.55, ease: 'power3.inOut', overwrite: true });
  };
  logo.addEventListener('mouseenter', open); logo.addEventListener('mouseleave', close);
  logo.addEventListener('focus', open); logo.addEventListener('blur', close);
})();
