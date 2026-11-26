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
  if (!MOTION) { document.documentElement.classList.add('intro-ready'); initHeroScroll(); return; }

  const wipes = $$('.hero-line .wipe');
  document.documentElement.classList.add('intro-ready');
  gsap.set(heroChars, { opacity: 0 });
  gsap.set('.hero-dot', { scale: 0, transformOrigin: '50% 80%' });
  gsap.set('.hero-fade', { y: 24, opacity: 0 });
  gsap.set('.hero-meta > span', { y: 14, opacity: 0 });
  gsap.set('.photo-inner', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.photo-img', { scale: 1.3 });
  gsap.set('.float-card', { y: 30, opacity: 0 });
  gsap.set('.navbar', { yPercent: -100, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  // each line: bar sweeps in from the left, letters appear under it, bar exits to the right
  wipes.forEach((w, i) => {
    const line = w.closest('.hero-line');
    const chars = $$('.split-char', line);
    const at = i * 0.18;
    tl.fromTo(w, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.45, ease: 'expo.inOut' }, at)
      .set(chars, { opacity: 1 }, at + 0.45)
      .set(w, { transformOrigin: '100% 50%' }, at + 0.45)
      .to(w, { scaleX: 0, duration: 0.5, ease: 'expo.inOut' }, at + 0.45);
  });
  tl.to('.hero-dot', { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.45)' }, 0.95)
    .to('.photo-inner', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.2)
    .to('.photo-img', { scale: 1, duration: 1.6 }, 0.2)
    .to('.navbar', { yPercent: 0, opacity: 1, duration: 0.9 }, 0.5)
    .to('.hero-meta > span', { y: 0, opacity: 1, duration: 0.7, stagger: 0.05 }, 0.6)
    .to('.hero-fade', { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 }, 0.8)
    .to('.float-card', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'back.out(1.6)' }, 1.0)
    .add(() => { initHeroScroll(); ScrollTrigger.refresh(); });
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
  initSpotlight();
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

  initDust($$('.work-card', track));
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
  const size = () => { fx.width = innerWidth; fx.height = innerHeight; };
  size(); addEventListener('resize', size);

  const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const COLORS = ['#3a3a44', '#55555f', '#8d8d97', '#e9e7df', '#c6ef4e'];

  const states = cards.map((card, ci) => {
    const r = card.getBoundingClientRect();
    const GW = 72, GH = Math.max(10, Math.min(60, Math.round(GW * r.height / r.width)));
    const cells = [];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const k = ci * 10000 + y * GW + x;
      cells.push({ x, y, th: (x / GW) * 0.78 + rand(k) * 0.22, r1: rand(k + 1), r2: rand(k + 2),
                   c: COLORS[rand(k + 3) < 0.06 ? 4 : Math.floor(rand(k + 4) * 4)] });
    }
    const mask = document.createElement('canvas'); mask.width = GW; mask.height = GH;
    const st = { card, cells, GW, GH, mask, mctx: mask.getContext('2d'), b: 0, d: 0, key: '' };
    ScrollTrigger.create({ trigger: card, start: 'top 98%', end: 'top 50%', scrub: true,
      onUpdate: (self) => { st.b = self.progress; } , onRefresh: (self) => { st.b = self.progress; } });
    ScrollTrigger.create({ trigger: card, start: 'top 28%', end: 'bottom 8%', scrub: true,
      onUpdate: (self) => { st.d = self.progress; }, onRefresh: (self) => { st.d = self.progress; } });
    return st;
  });

  const BUILD_SPAN = 0.16, DUST_SPAN = 0.3;

  function updateMask(st) {
    const key = st.b.toFixed(3) + '|' + st.d.toFixed(3);
    if (key === st.key) return;
    st.key = key;
    const { mctx, GW, GH } = st;
    mctx.clearRect(0, 0, GW, GH);
    mctx.fillStyle = '#000';
    for (const c of st.cells) if (st.b >= c.th && st.d < c.th) mctx.fillRect(c.x, c.y, 1, 1);
    const url = `url(${st.mask.toDataURL()})`;
    st.card.style.webkitMaskImage = url; st.card.style.maskImage = url;
  }

  function drawParticles(st) {
    const r = st.card.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 50) return;
    const cw = r.width / st.GW, chh = r.height / st.GH;
    const building = st.b > 0 && st.b < 1, dusting = st.d > 0 && st.d < 1;
    if (!building && !dusting) return;
    for (const c of st.cells) {
      const ox = r.left + (c.x + 0.5) * cw, oy = r.top + (c.y + 0.5) * chh;
      let t = -1, dx = 0, dy = 0;
      if (building && st.b < c.th && st.b > c.th - BUILD_SPAN) {        // flying in toward its spot
        t = (c.th - st.b) / BUILD_SPAN;
        dx = -(60 + c.r1 * 160) * t; dy = (c.r2 - 0.5) * 120 * t;
      } else if (dusting && st.d >= c.th && st.d < c.th + DUST_SPAN) {  // blowing away
        t = (st.d - c.th) / DUST_SPAN;
        const e = t * t;
        dx = (80 + c.r1 * 260) * e; dy = -(40 + c.r2 * 200) * e + Math.sin(c.r1 * 12 + t * 6) * 8;
      } else continue;
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.fillStyle = c.c;
      const sz = Math.max(1.2, Math.min(3, cw * 0.26)) * (1 - t * 0.4);
      // three fine specks per cell, spread inside the cell, so it reads as dust not pixels
      ctx.fillRect(ox + dx, oy + dy, sz, sz);
      ctx.fillRect(ox + dx * 1.15 + (c.r1 - 0.5) * cw, oy + dy * 0.9 + (c.r2 - 0.5) * chh, sz * 0.8, sz * 0.8);
      ctx.fillRect(ox + dx * 0.85 + (c.r2 - 0.5) * cw, oy + dy * 1.1 + (c.r1 - 0.5) * chh, sz * 0.7, sz * 0.7);
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
  initDetail();
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
