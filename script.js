// ===============================
// 1. EmailJS CONFIG (your values)
// ===============================
const EMAILJS_PUBLIC_KEY  = 'NrykGPzBzy2VEHlce';
const EMAILJS_SERVICE_ID  = 'service_npgoouk';
const EMAILJS_TEMPLATE_ID = 'template_ndkivcy';

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ===============================
// 2. PARTICLE BACKGROUND
// ===============================
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > this.canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > this.canvas.height || this.y < 0) this.speedY *= -1;
  }

  draw() {
    this.ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(canvas));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ===============================
// 3. SCROLL REVEAL
// ===============================
function reveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-section');
  const windowHeight = window.innerHeight;
  const elementVisible = 150;

  reveals.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      el.classList.add('active');
    }
  });
}

// ===============================
// 4. NAVBAR SCROLL EFFECT
// ===============================
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0,0,0,0.95)';
      navbar.style.backdropFilter = 'blur(20px)';
    } else {
      navbar.style.background = 'rgba(0,0,0,0.8)';
      navbar.style.backdropFilter = 'blur(10px)';
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();
}

// ===============================
// 5. STATS COUNTER (DECIMAL SUPPORT)
// ===============================
function animateStats() {
  const stats = document.querySelectorAll('.stat-item h3');
  stats.forEach((stat) => {
    const target = parseFloat(stat.getAttribute('data-count') || stat.textContent);
    if (isNaN(target)) return;

    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target.toFixed(2);  // Show 2 decimal places for CGPA
        clearInterval(timer);
      } else {
        stat.textContent = current.toFixed(2);
      }
    }, 20);
  });
}

// ===============================
// 6. MOBILE NAV MENU
// ===============================
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
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
// 7. INTERSECTION OBSERVER
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

  document.querySelectorAll('.reveal-section').forEach((el) =>
    observer.observe(el)
  );
}

// ===============================
// 8. MOUSE FOLLOWER
// ===============================
function initMouseFollower() {
  const mouse = document.createElement('div');
  mouse.className = 'mouse-follower';
  document.body.appendChild(mouse);

  document.addEventListener('mousemove', (e) => {
    mouse.style.left = e.clientX + 'px';
    mouse.style.top = e.clientY + 'px';
  });
}

// ===============================
// 9. SMOOTH SCROLL
// ===============================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ===============================
// 10. CONTACT FORM (EMAILJS)
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

    emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.classList.add('show');
        }
        form.reset();
        setTimeout(() => {
          if (successMsg) {
            successMsg.style.display = 'none';
            successMsg.classList.remove('show');
          }
        }, 5000);
      })
      .catch((error) => {
        alert('Form failed. Please email directly: pradhakrishna594@gmail.com');
        console.error('EmailJS error:', error);
      });
  });
}

// ===============================
// 11. LOADER
// ===============================
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

// ===============================
// 12. INITIALIZATION
// ===============================
window.addEventListener('load', () => {
  hideLoader();
  initParticles();
  initNavbarScroll();
  initMobileMenu();
  initSectionObserver();
  initMouseFollower();
  initSmoothScroll();
  initContactForm();
  reveal();
  setTimeout(animateStats, 800);  // Delay stats animation
});

window.addEventListener('scroll', reveal);
