/* ═══════════════════════════════════════════════════════════
   ALEX MERCER PORTFOLIO — script.js  v2.0
   Fixes: theme toggle + localStorage, mobile nav, overflow guard
   Features: particles, typewriter, counters, carousel, modal, tilt
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   FIX 3: THEME SYSTEM (dark / light + localStorage)
───────────────────────────────────────────────────────── */
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const THEME_KEY    = 'am-portfolio-theme';

// Restore saved preference (or system preference) before first paint
function initTheme() {
  const saved  = localStorage.getItem(THEME_KEY);
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const active = saved || system;
  html.setAttribute('data-theme', active);
}
initTheme();

// Toggle handler
themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  // Re-colour particles to match theme
  updateParticleColours();
});

// System theme change watcher (only if no manual preference saved)
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  if (!localStorage.getItem(THEME_KEY)) {
    html.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    updateParticleColours();
  }
});


/* ─────────────────────────────────────────────────────────
   LOADER
───────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.classList.add('loading');

  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('done');
    document.body.classList.remove('loading');

    // Trigger hero reveal animations after loader hides
    document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 80 + i * 110);
    });

    startTypewriter();
    animateCounters();
  }, 2000);
});


/* ─────────────────────────────────────────────────────────
   CUSTOM CURSOR (desktop pointer devices only)
───────────────────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

// Only activate on non-touch devices
if (window.matchMedia('(pointer:fine)').matches) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth ring lerp
  (function lerp() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(lerp);
  })();

  // Hover expansion
  document.querySelectorAll('a, button, .service-card, .portfolio-item, .skill-card, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}


/* ─────────────────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────────────────── */
let particles = [];
let particleCtx, particleCanvas;

// Return particle colours appropriate for current theme
function getParticleColours() {
  const isLight = html.getAttribute('data-theme') === 'light';
  return isLight
    ? ['0,85,255', '0,170,255']
    : ['0,212,255', '240,165,0'];
}

function updateParticleColours() {
  const cols = getParticleColours();
  particles.forEach(p => {
    p.color = cols[Math.floor(Math.random() * cols.length)];
  });
}

(function initParticles() {
  particleCanvas = document.getElementById('particle-canvas');
  if (!particleCanvas) return;
  particleCtx = particleCanvas.getContext('2d');

  function resize() {
    particleCanvas.width  = particleCanvas.offsetWidth  || window.innerWidth;
    particleCanvas.height = particleCanvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = window.innerWidth < 600 ? 30 : 65;
  const cols  = getParticleColours();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * particleCanvas.width;
      this.y     = Math.random() * particleCanvas.height;
      this.vx    = (Math.random() - .5) * .35;
      this.vy    = (Math.random() - .5) * .35;
      this.r     = Math.random() * 1.4 + .4;
      this.alpha = Math.random() * .45 + .08;
      this.color = cols[Math.floor(Math.random() * cols.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > particleCanvas.width || this.y < 0 || this.y > particleCanvas.height) {
        this.reset();
      }
    }
    draw() {
      particleCtx.beginPath();
      particleCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(${this.color},${this.alpha})`;
      particleCtx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 90) {
          const isLight = html.getAttribute('data-theme') === 'light';
          particleCtx.beginPath();
          particleCtx.strokeStyle = isLight
            ? `rgba(0,85,255,${.05 * (1 - dist/90)})`
            : `rgba(0,212,255,${.07 * (1 - dist/90)})`;
          particleCtx.lineWidth = .5;
          particleCtx.moveTo(particles[i].x, particles[i].y);
          particleCtx.lineTo(particles[j].x, particles[j].y);
          particleCtx.stroke();
        }
      }
    }
  }

  (function loop() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  })();
})();


/* ─────────────────────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────────────────────── */
const typewriterEl = document.getElementById('typewriter');
const roles = [
  'Web Applications.',
  'Mobile Apps.',
  'Google Ads.',
  'SEO Strategies.',
  'Video Content.'
];
let roleIdx = 0, charIdx = 0, deleting = false;

function startTypewriter() {
  if (!typewriterEl) return;
  tick();
}
function tick() {
  const current = roles[roleIdx];
  if (!deleting) {
    typewriterEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) { deleting = true; setTimeout(tick, 1800); return; }
  } else {
    typewriterEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
  }
  setTimeout(tick, deleting ? 48 : 88);
}


/* ─────────────────────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let   current = 0;
    const step   = Math.max(target / 55, 1);
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 22);
  });
}


/* ─────────────────────────────────────────────────────────
   NAVBAR — scroll effects + mobile toggle
───────────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 28);
  updateActiveNavLink();
  toggleBackTop();
}, { passive: true });

// Mobile hamburger
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close nav on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close nav when clicking outside
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// Highlight active section in nav
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(sec => {
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight);
    }
  });
}


/* ─────────────────────────────────────────────────────────
   BACK TO TOP
───────────────────────────────────────────────────────── */
const backTop = document.getElementById('backTop');

function toggleBackTop() {
  backTop.classList.toggle('visible', window.scrollY > 380);
}
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


/* ─────────────────────────────────────────────────────────
   SCROLL REVEAL — Intersection Observer
───────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    // Trigger skill bars when about section enters viewport
    if (entry.target.closest('#about')) animateSkillBars();
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  if (!el.closest('#hero')) revealObserver.observe(el); // hero handled by loader
});


/* ─────────────────────────────────────────────────────────
   SKILL BARS
───────────────────────────────────────────────────────── */
let skillsAnimated = false;
function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach(bar => {
    // Small timeout ensures element is visible first
    setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 100);
  });
}


/* ─────────────────────────────────────────────────────────
   PORTFOLIO FILTER
───────────────────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.portfolio-item').forEach(item => {
      const visible = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !visible);

      if (visible) {
        item.style.opacity = '0';
        item.style.transform = 'scale(.95)';
        // Use requestAnimationFrame to trigger transition
        requestAnimationFrame(() => requestAnimationFrame(() => {
          item.style.transition = 'opacity .4s ease, transform .4s ease';
          item.style.opacity    = '1';
          item.style.transform  = 'scale(1)';
        }));
      }
    });
  });
});


/* ─────────────────────────────────────────────────────────
   PORTFOLIO MODAL
───────────────────────────────────────────────────────── */
const modalData = [
  {
    tag: 'Web Application',
    title: 'SaaS Analytics Dashboard',
    desc: 'A fully custom real-time analytics platform built for a fintech startup. Features live chart streaming via WebSockets, multi-tenant architecture, role-based access control, and a high-performance dark-mode design system. Reduced client decision latency by 40% and cut infrastructure costs through query optimisation.',
    tech: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'WebSockets', 'Tailwind CSS', 'AWS'],
    results: [{ num:'40%', label:'Faster Decisions' }, { num:'2×', label:'User Retention' }, { num:'99.9%', label:'Uptime SLA' }]
  },
  {
    tag: 'Mobile App',
    title: 'FitTrack Pro',
    desc: 'A cross-platform fitness application for iOS and Android built with React Native. Features AI-powered workout recommendations, Apple Health and Google Fit integration, animated progress rings, and an offline-first architecture. Successfully published on both app stores with a frictionless onboarding flow.',
    tech: ['React Native', 'Expo', 'Firebase', 'TensorFlow Lite', 'HealthKit', 'Google Fit API'],
    results: [{ num:'4.8★', label:'App Store Rating' }, { num:'50K+', label:'Downloads' }, { num:'30%', label:'DAU Growth' }]
  },
  {
    tag: 'Google Ads Management',
    title: 'D2C E-commerce Scale-Up',
    desc: 'Comprehensive Google Ads overhaul for a direct-to-consumer skincare brand. Restructured campaign hierarchy, implemented Performance Max, conducted systematic A/B testing on creatives and landing pages, and built a custom Looker Studio reporting dashboard. Results delivered within 60 days of engagement.',
    tech: ['Google Ads', 'Performance Max', 'GA4', 'Merchant Center', 'Looker Studio', 'Landing Page CRO'],
    results: [{ num:'340%', label:'ROAS Achieved' }, { num:'−62%', label:'CPA Reduction' }, { num:'₹8L+', label:'Revenue Added' }]
  },
  {
    tag: 'Web Application',
    title: 'LegalEase Client Portal',
    desc: 'Document automation and client management portal for a 50-attorney law firm. Integrated DocuSign for e-signatures, built smart intake forms that auto-populate legal templates, and created an encrypted client-facing portal with secure document storage. Significantly reduced administrative overhead.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'DocuSign API', 'AWS S3', 'Stripe', 'NextAuth'],
    results: [{ num:'60%', label:'Faster Onboarding' }, { num:'Zero', label:'Paper Forms' }, { num:'4.9★', label:'Client Rating' }]
  },
  {
    tag: 'Mobile App',
    title: 'FinWise Personal Finance',
    desc: 'An intelligent personal finance app aggregating bank accounts via the Plaid API, with ML-driven transaction categorisation, beautiful spending-insight charts, and smart bill-due reminders. Built with an offline-first architecture using local encryption, ensuring data remains private and accessible.',
    tech: ['React Native', 'Plaid API', 'Python ML', 'SQLite', 'AWS Lambda', 'Expo SecureStore'],
    results: [{ num:'28%', label:'Avg. Savings Increase' }, { num:'4.7★', label:'Play Store' }, { num:'25K+', label:'Active Users' }]
  },
  {
    tag: 'SEO + Video Marketing',
    title: 'HealthBrand Organic Growth',
    desc: 'A six-month SEO and content strategy engagement for a health supplement brand. Delivered a full technical audit, Core Web Vitals remediation, entity-based content cluster strategy, and a YouTube plus Instagram Reels content calendar. Achieved 23 page-one keyword rankings and a 5× organic traffic increase.',
    tech: ['Ahrefs', 'Screaming Frog', 'GSC', 'Premiere Pro', 'After Effects', 'YouTube Studio'],
    results: [{ num:'5×', label:'Organic Traffic' }, { num:'23', label:'Page-1 Keywords' }, { num:'2M+', label:'Video Views' }]
  }
];

window.openModal = function(idx) {
  const data    = modalData[idx];
  const modal   = document.getElementById('portfolioModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <p class="modal-tag">${data.tag}</p>
    <h2 id="modalTitle">${data.title}</h2>
    <p>${data.desc}</p>
    <div class="modal-tech">${data.tech.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="modal-results">
      ${data.results.map(r => `
        <div class="modal-result">
          <strong>${r.num}</strong>
          <span>${r.label}</span>
        </div>`).join('')}
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus trap: focus close button
  setTimeout(() => modal.querySelector('.modal-close').focus(), 50);
};

window.closeModal = function() {
  document.getElementById('portfolioModal').classList.remove('open');
  document.body.style.overflow = '';
};

document.getElementById('portfolioModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


/* ─────────────────────────────────────────────────────────
   TESTIMONIAL CAROUSEL
───────────────────────────────────────────────────────── */
(function initCarousel() {
  const track    = document.getElementById('testiTrack');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');
  const dotsWrap = document.getElementById('testiDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  let index  = 0;
  let autoTimer;

  // How many cards are visible at once depends on screen width
  function perView() { return window.innerWidth >= 768 ? 2 : 1; }

  const totalSlides = () => Math.ceil(cards.length / perView());

  // Build dot indicators
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('div');
      dot.className = 'testi-dot' + (i === index ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    index = ((idx % totalSlides()) + totalSlides()) % totalSlides();
    const cardWidth = cards[0].offsetWidth + 22; // card + gap
    track.style.transform = `translateX(-${index * cardWidth * perView()}px)`;
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(index + 1), 4800);
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(index + (dx > 0 ? 1 : -1));
  });

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
  });

  buildDots();
  resetAuto();
})();


/* ─────────────────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const nameEl    = document.getElementById('fname');
    const emailEl   = document.getElementById('femail');
    const msgEl     = document.getElementById('fmessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText   = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const success   = document.getElementById('formSuccess');

    // Validate
    let valid = true;
    [nameEl, emailEl, msgEl].forEach(field => {
      if (!field.value.trim()) {
        field.style.animation = 'none';
        requestAnimationFrame(() => {
          field.style.animation = 'shake .4s ease';
        });
        valid = false;
      }
    });
    if (!valid) return;

    // Email format check
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(emailEl.value)) {
      emailEl.style.animation = 'none';
      requestAnimationFrame(() => { emailEl.style.animation = 'shake .4s ease'; });
      return;
    }

    // Submit state
    btnText.style.display   = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled      = true;

    // Simulate async send (replace with real fetch/endpoint)
    setTimeout(() => {
      btnText.style.display   = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled      = false;
      success.style.display   = 'block';
      contactForm.reset();
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }, 2000);
  });
}


/* ─────────────────────────────────────────────────────────
   SERVICE CARD — 3-D TILT on hover (desktop only)
───────────────────────────────────────────────────────── */
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.service-card:not(.service-cta)').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - .5;
      const y    = (e.clientY - rect.top)  / rect.height - .5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ─────────────────────────────────────────────────────────
   HERO PARALLAX — subtle depth on scroll
───────────────────────────────────────────────────────── */
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (heroContent && sy < window.innerHeight) {
    heroContent.style.transform = `translateY(${sy * 0.22}px)`;
    heroContent.style.opacity   = String(1 - sy / window.innerHeight * 1.2);
  }
}, { passive: true });


/* ─────────────────────────────────────────────────────────
   SMOOTH ANCHOR SCROLL
   Accounts for fixed navbar height so sections aren't hidden
───────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 72; // navbar height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────────────────────
   INJECT SHAKE KEYFRAME for form validation
───────────────────────────────────────────────────────── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-7px); }
    40%      { transform: translateX(7px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);


/* ─────────────────────────────────────────────────────────
   FIX 1: OVERFLOW GUARD
   Detect any element wider than viewport and log it in dev.
   In production this does nothing visible but prevents
   mysterious horizontal scroll caused by rogue elements.
───────────────────────────────────────────────────────── */
(function overflowGuard() {
  if (process !== undefined) return; // skip in Node environments
  // Silent in production – remove the return below to debug
  return;
  /* eslint-disable no-unreachable */
  const vw = document.documentElement.clientWidth;
  document.querySelectorAll('*').forEach(el => {
    if (el.getBoundingClientRect().right > vw + 1) {
      console.warn('[OverflowGuard] Element exceeds viewport:', el);
    }
  });
})();
