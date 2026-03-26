/* ═══════════════════════════════════════════════════════
   ALEX MERCER PORTFOLIO — script.js
   All animations, interactions & dynamic behaviour
═══════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   LOADER
──────────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.classList.add('loading');
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('done');
    document.body.classList.remove('loading');
    // Trigger hero animations after loader
    document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 100 + i * 120);
    });
    startTypewriter();
    animateCounters();
  }, 2000);
});

/* ────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

// Smooth cursor ring (lerp)
function animateCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover state for interactive elements
const hoverTargets = 'a, button, .service-card, .portfolio-item, .skill-card, .filter-btn, .testi-prev, .testi-next';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ────────────────────────────────────────────
   PARTICLE CANVAS
──────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;
  const particles = [];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.r  = Math.random() * 1.5 + .5;
      this.alpha = Math.random() * .5 + .1;
      this.color = Math.random() > .5 ? '0,212,255' : '240,165,0';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Draw connecting lines between close particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${.08 * (1 - dist/100)})`;
          ctx.lineWidth = .5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ────────────────────────────────────────────
   TYPEWRITER
──────────────────────────────────────────── */
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
  setTimeout(tick, deleting ? 50 : 90);
}

/* ────────────────────────────────────────────
   COUNTER ANIMATION
──────────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 24);
  });
}

/* ────────────────────────────────────────────
   NAVBAR
──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveNavLink();
  toggleBackTop();
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active section highlight
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 120;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const link   = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

/* ────────────────────────────────────────────
   BACK TO TOP
──────────────────────────────────────────── */
const backTop = document.getElementById('backTop');

function toggleBackTop() {
  backTop.classList.toggle('visible', window.scrollY > 400);
}

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ────────────────────────────────────────────
   SCROLL REVEAL (Intersection Observer)
──────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Animate skill bars when about section reveals
        if (entry.target.closest('#about')) animateSkillBars();
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  // Don't re-observe hero elements (handled by loader)
  if (!el.closest('#hero')) revealObserver.observe(el);
});

/* ────────────────────────────────────────────
   SKILL BARS
──────────────────────────────────────────── */
let skillsAnimated = false;

function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach(bar => {
    bar.style.width = bar.dataset.pct + '%';
  });
}

/* ────────────────────────────────────────────
   PORTFOLIO FILTER
──────────────────────────────────────────── */
const filterBtns   = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !match);
      // Animate in
      if (match) {
        item.style.animation = 'none';
        requestAnimationFrame(() => {
          item.style.animation = '';
          item.style.opacity = '0';
          item.style.transform = 'scale(.95)';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity .4s ease, transform .4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        });
      }
    });
  });
});

/* ────────────────────────────────────────────
   PORTFOLIO MODAL
──────────────────────────────────────────── */
const modalData = [
  {
    tag: 'Web Application',
    title: 'SaaS Analytics Dashboard',
    desc: 'A fully custom real-time analytics SaaS platform built for a fintech startup. Features live chart streaming via WebSockets, multi-tenant architecture, role-based access control, and a sleek dark-mode design system. Reduced decision latency for end users by 40%.',
    tech: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'WebSockets', 'Tailwind CSS', 'AWS'],
    results: [{ num: '40%', label: 'Faster Decisions' }, { num: '2×', label: 'User Retention' }, { num: '99.9%', label: 'Uptime' }]
  },
  {
    tag: 'Mobile App',
    title: 'FitTrack Pro',
    desc: 'A cross-platform fitness application for iOS and Android built with React Native. Features AI-powered workout recommendations, Apple Health / Google Fit integration, custom animated progress rings, and an offline-first architecture. Published on both app stores.',
    tech: ['React Native', 'Expo', 'Firebase', 'TensorFlow Lite', 'HealthKit'],
    results: [{ num: '4.8★', label: 'App Store Rating' }, { num: '50K+', label: 'Downloads' }, { num: '30%', label: 'DAU Growth' }]
  },
  {
    tag: 'Google Ads Management',
    title: 'E-commerce Growth Campaign',
    desc: 'Complete Google Ads overhaul for a D2C skincare brand — restructured campaigns, implemented Performance Max, ran A/B creative tests on search & shopping, and built a conversion-focused landing page. Results delivered within 60 days.',
    tech: ['Google Ads', 'Performance Max', 'Analytics 4', 'Merchant Center', 'Looker Studio'],
    results: [{ num: '340%', label: 'ROAS' }, { num: '−62%', label: 'CPA Drop' }, { num: '₹8L', label: 'Revenue Added' }]
  },
  {
    tag: 'Web Application',
    title: 'LegalEase Client Portal',
    desc: 'Document automation and client management portal for a 50-attorney law firm. Integrated DocuSign for e-signatures, built a smart intake form that pre-populates legal templates, and created a secure client-facing portal with encrypted document storage.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'DocuSign API', 'AWS S3', 'Stripe'],
    results: [{ num: '60%', label: 'Faster Onboarding' }, { num: '0', label: 'Paper Forms' }, { num: '4.9★', label: 'Client Rating' }]
  },
  {
    tag: 'Mobile App',
    title: 'FinWise Personal Finance',
    desc: 'An intuitive personal finance app that aggregates bank accounts via Plaid API, auto-categorises transactions using ML, provides spending insights with beautiful charts, and sends smart bill-due reminders. 100% offline-capable with local encryption.',
    tech: ['React Native', 'Plaid API', 'Python ML', 'SQLite', 'AWS Lambda'],
    results: [{ num: '28%', label: 'Savings Increase' }, { num: '4.7★', label: 'Play Store' }, { num: '25K+', label: 'Active Users' }]
  },
  {
    tag: 'SEO + Video Marketing',
    title: 'HealthBrand Organic Scale',
    desc: 'A 6-month SEO and content strategy engagement for a health supplement brand. Technical audit, Core Web Vitals fixes, entity-based content clusters, and a YouTube + Instagram Reels content calendar. Ranked 23 keywords on Page 1.',
    tech: ['Ahrefs', 'Screaming Frog', 'Premiere Pro', 'After Effects', 'Google Search Console'],
    results: [{ num: '5×', label: 'Organic Traffic' }, { num: '23', label: 'Page-1 Keywords' }, { num: '2M+', label: 'Video Views' }]
  }
];

window.openModal = function(idx) {
  const data    = modalData[idx];
  const modal   = document.getElementById('portfolioModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <p class="modal-tag">${data.tag}</p>
    <h2>${data.title}</h2>
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

/* ────────────────────────────────────────────
   TESTIMONIAL CAROUSEL
──────────────────────────────────────────── */
(function initCarousel() {
  const track   = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsContainer = document.getElementById('testiDots');
  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  let currentIndex = 0;
  let autoTimer;
  let perSlide = window.innerWidth >= 768 ? 2 : 1;

  const totalSlides = Math.ceil(cards.length / perSlide);

  // Build dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function goTo(idx) {
    currentIndex = (idx + totalSlides) % totalSlides;
    const cardWidth = cards[0].offsetWidth + 24; // card + gap
    track.style.transform = `translateX(-${currentIndex * cardWidth * perSlide}px)`;
    dotsContainer.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(currentIndex + 1), 4500);
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(currentIndex + (dx > 0 ? 1 : -1));
  });

  window.addEventListener('resize', () => {
    perSlide = window.innerWidth >= 768 ? 2 : 1;
    goTo(0);
  });

  resetAuto();
})();

/* ────────────────────────────────────────────
   CONTACT FORM
──────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn    = document.getElementById('submitBtn');
    const text   = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    const success = document.getElementById('formSuccess');

    // Basic validation
    const name  = document.getElementById('fname').value.trim();
    const email = document.getElementById('femail').value.trim();
    const msg   = document.getElementById('fmessage').value.trim();

    if (!name || !email || !msg) {
      // Shake empty fields
      [document.getElementById('fname'), document.getElementById('femail'), document.getElementById('fmessage')].forEach(field => {
        if (!field.value.trim()) {
          field.style.animation = 'none';
          requestAnimationFrame(() => {
            field.style.animation = 'shake .4s ease';
          });
        }
      });
      return;
    }

    text.style.display   = 'none';
    loader.style.display = 'inline';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      text.style.display   = 'inline';
      loader.style.display = 'none';
      btn.disabled = false;
      success.style.display = 'block';
      contactForm.reset();
      setTimeout(() => success.style.display = 'none', 5000);
    }, 2000);
  });
}

/* ────────────────────────────────────────────
   SHAKE KEYFRAME (injected for form validation)
──────────────────────────────────────────── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ────────────────────────────────────────────
   SMOOTH ANCHOR SCROLL (override for nav links
   — ensures offset accounts for sticky navbar)
──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ────────────────────────────────────────────
   PARALLAX — subtle hero heading drift
──────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
    heroContent.style.opacity   = 1 - scrolled / window.innerHeight;
  }
});

/* ────────────────────────────────────────────
   SERVICE CARD — 3D TILT
──────────────────────────────────────────── */
document.querySelectorAll('.service-card:not(.service-cta)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - .5;
    const y = (e.clientY - rect.top)  / rect.height - .5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
