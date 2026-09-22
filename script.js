// ===============================
// 1. EMAILJS CONFIG
// ===============================
const EMAILJS_PUBLIC_KEY  = 'NrykGPzBzy2VEHlce';
const EMAILJS_SERVICE_ID  = 'service_npgoouk';
const EMAILJS_TEMPLATE_ID = 'template_ndkivcy';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ===============================
// 2. THEME TOGGLE
// ===============================
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('portfolio-theme');

  if (stored) {
    root.setAttribute('data-theme', stored);
  }

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('portfolio-theme', next);
  });
}

// ===============================
// 3. CONSTELLATION PARTICLE BACKGROUND
// ===============================
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;
  const LINK_DIST = 130;
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 35 : 70;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.6 + 0.8;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight() ? 'rgba(59, 99, 224, 0.55)' : 'rgba(91, 140, 255, 0.6)';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const lineColor = isLight() ? '59, 99, 224' : '45, 212, 200';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${lineColor}, ${0.16 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', init);
}

// ===============================
// 4. SCROLL PROGRESS BAR
// ===============================
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update);
  update();
}

// ===============================
// 5. SCROLL REVEAL
// ===============================
function reveal() {
  const reveals = document.querySelectorAll('.reveal-section');
  const windowHeight = window.innerHeight;
  const elementVisible = 120;

  reveals.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      el.classList.add('active');
    }
  });
}

// ===============================
// 6. NAVBAR SCROLL EFFECT + ACTIVE LINK
// ===============================
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((sec) => observer.observe(sec));
}

// ===============================
// 7. STATS COUNTER
// ===============================
function animateStats() {
  const stats = document.querySelectorAll('.stat-item h3');
  stats.forEach((stat) => {
    const target = parseFloat(stat.getAttribute('data-count'));
    if (isNaN(target)) return;

    let current = 0;
    const increment = target / 80;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = Number.isInteger(target) ? target : target.toFixed(2);
        clearInterval(timer);
      } else {
        stat.textContent = Number.isInteger(target) ? Math.floor(current) : current.toFixed(2);
      }
    }, 20);
  });
}

function initStatsOnView() {
  const statsBlock = document.querySelector('.stats');
  if (!statsBlock) return;

  let done = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !done) {
        done = true;
        animateStats();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(statsBlock);
}

// ===============================
// 8. HERO TYPED ROLES
// ===============================
function initTypedRoles() {
  const el = document.getElementById('typed');
  if (!el) return;

  const roles = [
    'CSE Undergraduate',
    'ML & CV Enthusiast',
    'Problem Solver',
    'Builder of Things',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1500);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 80);
  }

  tick();
}

// ===============================
// 9. MOBILE NAV MENU
// ===============================
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// ===============================
// 10. INTERSECTION OBSERVER (sections + items)
// ===============================
function initSectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-section, .reveal-item').forEach((el) =>
    observer.observe(el)
  );
}

// ===============================
// 11. SMOOTH SCROLL
// ===============================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ===============================
// 12. PROJECT FILTERING
// ===============================
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('[data-category]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ===============================
// 13. CONTACT FORM (EMAILJS)
// ===============================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('successMsg');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (typeof emailjs === 'undefined') {
      alert('EmailJS not loaded. Please email directly: pradhakrishna594@gmail.com');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        if (successMsg) {
          successMsg.classList.add('show');
        }
        form.reset();
        setTimeout(() => {
          if (successMsg) successMsg.classList.remove('show');
        }, 5000);
      })
      .catch((error) => {
        alert('Form failed. Please email directly: pradhakrishna594@gmail.com');
        console.error('EmailJS error:', error);
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
  });
}

// ===============================
// 14. LOADER
// ===============================
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.visibility = 'hidden';
  }, 500);
}

// ===============================
// 15. FOOTER YEAR
// ===============================
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ===============================
// 16. INITIALIZATION
// ===============================
initTheme();

window.addEventListener('load', () => {
  hideLoader();
  initParticles();
  initScrollProgress();
  initNavbarScroll();
  initActiveNav();
  initMobileMenu();
  initSectionObserver();
  initSmoothScroll();
  initProjectFilter();
  initContactForm();
  initTypedRoles();
  initStatsOnView();
  initFooterYear();
  reveal();
});

window.addEventListener('scroll', reveal);
