// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category || 'all';
    filterCards(category, btn);
  });
});

document.querySelectorAll('.wa-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => selectWaCategory(btn));
});
// Scroll reveal with stagger
const allReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .pillar, .program-card, .camp-feature, .info-card');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

allReveal.forEach((el, i) => {
  if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
    el.classList.add('reveal');
  }
  el.style.transitionDelay = (i % 5) * 0.07 + 's';
  revealObserver.observe(el);
});

// Program filter
function filterCards(category, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.program-card').forEach((card, i) => {
    const match = category === 'all' || card.dataset.category === category;
    card.style.opacity = match ? '1' : '0.12';
    card.style.transform = match ? '' : 'scale(0.95)';
    card.style.pointerEvents = match ? '' : 'none';
    if (match) {
      card.style.animation = `cardPop 0.4s ${i * 0.05}s both`;
    }
  });
}

// WA enquiry panel
function selectWaCategory(btn) {
  document.querySelectorAll('.wa-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('waSendBtn').href = btn.data-href;
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-question').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (!isExpanded) {
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Active nav
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a:not(.nav-cta)');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navAs.forEach(a => { a.style.color = a.getAttribute('href') === '#' + current ? 'var(--gold)' : ''; });
});

// Parallax subtle on hero
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.style.transform = `translateY(${y * 0.3}px)`;
});
