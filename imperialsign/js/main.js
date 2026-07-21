/* ACRLIC — interactions */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initSlider();
  initReveal();
  initAuthForms();
  initOrderForm();
  initContactForm();
  initDashboardOrders();
});

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40 || !header.classList.contains('dark')) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function initSlider() {
  const slider = document.getElementById('slider');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('.slide')];
  const dotsWrap = document.getElementById('sliderDots');
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = [...dotsWrap.querySelectorAll('.dot')];

  function goTo(i) {
    slides[index].classList.remove('active');
    dots[index].classList.remove('active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 5500);
  }

  prev?.addEventListener('click', () => goTo(index - 1));
  next?.addEventListener('click', () => goTo(index + 1));

  resetTimer();
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((el) => io.observe(el));
}

function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const alert = document.getElementById('loginAlert');
      alert?.classList.add('show');
      const user = {
        email: loginForm.email.value,
        loggedIn: true,
      };
      localStorage.setItem('acrlic_user', JSON.stringify(user));
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = registerForm.password.value;
      const confirm = registerForm.confirm.value;
      if (pass !== confirm) {
        alert('Passwords do not match.');
        return;
      }
      const alertEl = document.getElementById('registerAlert');
      alertEl?.classList.add('show');
      const user = {
        firstName: registerForm.firstName.value,
        lastName: registerForm.lastName.value,
        email: registerForm.email.value,
        company: registerForm.company.value,
      };
      localStorage.setItem('acrlic_user', JSON.stringify(user));
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    });
  }
}

function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const preview = document.getElementById('livePreview');
  const prices = {
    'teal-edge': 48,
    'copper-mirror': 62,
    'sky-led': 95,
    'matte-flat': 28,
    walnut: 55,
    frosted: 40,
  };

  const styleLabels = {
    'teal-edge': 'Teal Edge Cut',
    'copper-mirror': 'Copper Mirror',
    'sky-led': 'Sky LED Back',
    'matte-flat': 'Matte Flat Cut',
    walnut: 'Walnut Face Cap',
    frosted: 'Frosted Clear',
  };

  const params = new URLSearchParams(window.location.search);
  const styleParam = params.get('style');
  if (styleParam && form.style.querySelector(`option[value="${styleParam}"]`)) {
    form.style.value = styleParam;
  }

  function update() {
    const text = form.letterText.value.trim() || 'ACRLIC';
    const letters = text.replace(/\s/g, '').length || 1;
    const style = form.style.value;
    const height = Number(form.height.value);
    const thickness = Number(form.thickness.value);
    const qty = Number(form.qty.value) || 1;
    const color = form.color.value;

    const heightFactor = height / 15;
    const thickFactor = thickness / 5;
    const unit = prices[style] * heightFactor * thickFactor;
    const total = Math.round(unit * letters * qty);

    preview.textContent = text;
    preview.style.color = color;
    preview.style.fontSize = `${Math.min(1.2 + height / 20, 3.2)}rem`;

    document.getElementById('sumLetters').textContent = String(letters);
    document.getElementById('sumStyle').textContent = styleLabels[style];
    document.getElementById('sumSize').textContent = `${height} cm · ${thickness} mm`;
    document.getElementById('sumQty').textContent = `${qty} set${qty > 1 ? 's' : ''}`;
    document.getElementById('sumTotal').textContent = `$${total.toLocaleString()}`;
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = form.letterText.value.trim();
    const order = {
      id: 'ACR-' + (1000 + Math.floor(Math.random() * 900)),
      text,
      style: form.style.value,
      height: form.height.value,
      thickness: form.thickness.value,
      color: form.color.value,
      mount: form.mount.value,
      qty: form.qty.value,
      notes: form.notes.value,
      total: document.getElementById('sumTotal').textContent,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const existing = JSON.parse(localStorage.getItem('acrlic_orders') || '[]');
    existing.unshift(order);
    localStorage.setItem('acrlic_orders', JSON.stringify(existing));

    alert(`Order ${order.id} submitted!\nText: ${order.text}\nEst. total: ${order.total}`);
    window.location.href = 'dashboard.html';
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('contactAlert')?.classList.add('show');
    form.reset();
  });
}

function initDashboardOrders() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  const styleLabels = {
    'teal-edge': 'Teal Edge Cut',
    'copper-mirror': 'Copper Mirror',
    'sky-led': 'Sky LED Back',
    'matte-flat': 'Matte Flat Cut',
    walnut: 'Walnut Face Cap',
    frosted: 'Frosted Clear',
  };

  const saved = JSON.parse(localStorage.getItem('acrlic_orders') || '[]');
  if (!saved.length) return;

  const statusClass = {
    Pending: 'status-pending',
    Production: 'status-production',
    Shipped: 'status-shipped',
    Cancelled: 'status-cancelled',
  };

  const rows = saved
    .map((order) => {
      const style = styleLabels[order.style] || order.style;
      const cls = statusClass[order.status] || 'status-pending';
      return `<tr>
        <td>${order.id}</td>
        <td>${escapeHtml(order.text)}</td>
        <td>${style}</td>
        <td>${order.date}</td>
        <td>${order.total}</td>
        <td><span class="status ${cls}">${order.status}</span></td>
        <td><a href="order.html" class="btn btn-secondary btn-sm">View</a></td>
      </tr>`;
    })
    .join('');

  tbody.insertAdjacentHTML('afterbegin', rows);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
