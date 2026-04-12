/* ============================================
   EMBER FIRE KITCHEN — MAIN JS
============================================ */

// === THEME ===
(function() {
  const saved = localStorage.getItem('ember-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ember-theme', next);
}

// === LOADER ===
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('pageLoader');
  const fill = document.querySelector('.loader-fill');
  const counter = document.getElementById('loaderCounter');
  if (!loader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (fill) fill.style.width = '100%';
      if (counter) counter.textContent = '100';
      setTimeout(() => { loader.classList.add('hidden'); }, 500);
    } else {
      if (fill) fill.style.width = progress + '%';
      if (counter) counter.textContent = Math.floor(progress);
    }
  }, 60);
});

// === CUSTOM CURSOR ===
const cursor = document.getElementById('cursor');
if (cursor && window.innerWidth > 900) {
  let mx = -200, my = -200, cx = -200, cy = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  
  function animateCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('img, .hero-panel-left, .phil-img-container, .df-img-wrap').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover-img'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover-img'));
  });
  document.querySelectorAll('a, button, .dish-tab, .filter-pill').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover-btn'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover-btn'));
  });
}

// === NAV SCROLL ===
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });
}

// === MOBILE MENU ===
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('.mm-link').forEach(l => {
    l.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// === THEME BUTTON ===
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) { themeBtn.addEventListener('click', toggleTheme); }

// === HERO DISH TABS ===
const dishTabs = document.querySelectorAll('.dish-tab');
const heroImg = document.getElementById('heroImg');
if (dishTabs.length && heroImg) {
  dishTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dishTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      heroImg.style.opacity = '0';
      heroImg.style.transform = 'scale(1.12)';
      setTimeout(() => {
        heroImg.src = tab.dataset.img;
        heroImg.style.opacity = '1';
        heroImg.style.transform = 'scale(1.08)';
      }, 300);
    });
  });
  heroImg.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  setTimeout(() => heroImg.classList.add('zoomed'), 100);
}

// === SCROLL REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal-section, .reveal-item').forEach(el => {
    revealObserver.observe(el);
  });
}
window.addEventListener('DOMContentLoaded', initReveal);

// === CART STATE ===
let cart = [];

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const items = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const count = document.getElementById('cartCount');
  const total = document.getElementById('cartTotal');

  if (count) count.textContent = getCartCount();
  if (total) total.textContent = '₹' + getCartTotal().toLocaleString('en-IN');

  if (!items) return;

  if (cart.length === 0) {
    items.innerHTML = '<p class="cart-empty">Your cart is empty.<br/>Add something from our menu.</p>';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  items.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <div class="ci-qty">
        <button class="ci-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="ci-num">${item.qty}</span>
        <button class="ci-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price: parseInt(price), qty: 1 });
  }
  updateCartUI();
  showNotification(`${name} added to cart`);
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function placeOrder() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(8,7,7,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;';
  overlay.innerHTML = `
    <div style="font-family:'Bebas Neue',sans-serif;font-size:5rem;color:#e8651a;letter-spacing:0.1em;animation:fadeIn 0.6s ease">🔥</div>
    <h2 style="font-family:'Cormorant Garamond',serif;color:#f0e8dc;font-size:2.5rem;font-weight:300;text-align:center;padding:0 2rem;">Order Confirmed!</h2>
    <p style="color:#c8b99a;font-size:0.9rem;letter-spacing:0.1em;text-transform:uppercase;text-align:center">We'll confirm via SMS shortly</p>
  `;
  document.body.appendChild(overlay);
  cart = [];
  updateCartUI();
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { overlay.remove(); toggleCart(); }, 500);
  }, 2500);
}

function showNotification(msg) {
  const n = document.createElement('div');
  n.className = 'notification';
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; n.style.transform = 'translateY(10px)'; n.style.transition = '0.4s ease'; setTimeout(() => n.remove(), 400); }, 2500);
}

// === CART TRIGGERS ===
window.addEventListener('DOMContentLoaded', () => {
  const cartTrigger = document.getElementById('cartTrigger');
  if (cartTrigger) cartTrigger.addEventListener('click', toggleCart);
  
  const cartClose = document.getElementById('cartClose');
  if (cartClose) cartClose.addEventListener('click', toggleCart);
  
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

  // Add-to-cart buttons (shop page)
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = this.dataset.name;
      const price = this.dataset.price;
      const id = name.replace(/\s+/g, '-').toLowerCase();
      addToCart(id, name, price);
      
      const orig = this.textContent;
      this.textContent = '✓ Added';
      this.style.borderColor = '#3da85a';
      this.style.color = '#3da85a';
      setTimeout(() => {
        this.textContent = orig;
        this.style.borderColor = '';
        this.style.color = '';
      }, 1200);
    });
  });

  updateCartUI();
});

// === FILTER TABS (shop) ===
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      document.querySelectorAll('.menu-card').forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
          card.style.animation = 'slideFromRight 0.3s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
});

// === FAQ TOGGLE ===
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
});

// === CONTACT FORM ===
function submitForm(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  if (success) {
    success.style.display = 'block';
    e.target.reset();
    setTimeout(() => { success.style.display = 'none'; }, 5000);
  }
}

// === REVIEW SCROLL NAV ===
window.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('reviewsScroller');
  const prev = document.getElementById('reviewPrev');
  const next = document.getElementById('reviewNext');
  if (scroller && prev && next) {
    const cardWidth = 300;
    prev.addEventListener('click', () => { scroller.scrollLeft -= cardWidth; });
    next.addEventListener('click', () => { scroller.scrollLeft += cardWidth; });
  }
});

// === PARALLAX (hero image subtle) ===
window.addEventListener('scroll', () => {
  const heroImg = document.getElementById('heroImg');
  if (heroImg && window.scrollY < window.innerHeight) {
    heroImg.style.transform = `scale(1.08) translateY(${window.scrollY * 0.15}px)`;
  }
});

// === SMOOTH ACTIVE STATE FOR PAGES ===
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('pages/', '').replace('.html', '')) && link.getAttribute('href') !== 'index.html') {
      link.classList.add('active');
    }
  });
});
