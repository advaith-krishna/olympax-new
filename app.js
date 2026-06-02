// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

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
  document.getElementById('waSendBtn').href = btn.dataset.href;
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

async function fetchProducts() {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*');

    if (error) {
      console.error('Failed to fetch products:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error while fetching products:', error);
    return [];
  }
}

function formatProductPrice(value) {
  if (value == null || value === '') {
    return 'Price not available';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(number);
}

function getProductImageUrl(product) {
  const imageUrl = product.image_url || product.image || product.imageUrl || product.photo || '';

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  try {
    const { data } = supabaseClient.storage.from('products').getPublicUrl(imageUrl);
    return data?.publicUrl || '';
  } catch (error) {
    console.warn('Error getting image URL for bucket file:', error);
    return '';
  }
}

const FALLBACK_IMAGE_URL = 'https://placehold.co/400x300?text=No+Image';

function renderProducts(products) {
  const container = document.getElementById('products-grid');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!products || products.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No products are available at the moment. Please check back soon.';
    emptyMessage.style.color = 'var(--muted)';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem 1rem';
    emptyMessage.style.gridColumn = '1 / -1';
    container.appendChild(emptyMessage);
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'product-image';

    const image = document.createElement('img');
    const productImageUrl = getProductImageUrl(product);
    const fallbackImageUrl = FALLBACK_IMAGE_URL;

    image.src = productImageUrl || fallbackImageUrl;
    image.alt = product.name ? `${product.name} product image` : 'Product image';
    image.onerror = function() {
      if (this.src !== fallbackImageUrl) {
        this.src = fallbackImageUrl;
      }
    };

    imageWrapper.appendChild(image);
    card.appendChild(imageWrapper);

    const info = document.createElement('div');
    info.style.padding = '16px';
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '8px';

    const name = document.createElement('h4');
    name.textContent = product.name || 'Unnamed product';
    name.style.margin = '0';
    name.style.fontSize = '1.05rem';
    name.style.fontWeight = '700';
    info.appendChild(name);

    const category = document.createElement('div');
    category.textContent = product.category ? product.category : 'Uncategorized';
    category.style.color = 'var(--muted)';
    category.style.fontSize = '0.85rem';
    category.style.textTransform = 'uppercase';
    category.style.letterSpacing = '0.08em';
    category.style.fontWeight = '700';
    info.appendChild(category);

    const price = document.createElement('div');
    price.textContent = formatProductPrice(product.price);
    price.style.marginTop = 'auto';
    price.style.fontWeight = '700';
    price.style.color = 'var(--gold)';
    info.appendChild(price);

    card.appendChild(info);
    container.appendChild(card);
  });
}

async function loadProducts() {
  const products = await fetchProducts();
  renderProducts(products);
}

window.addEventListener('DOMContentLoaded', loadProducts);
