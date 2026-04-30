/* =============================================
   LEADYX — CLIENT ACQUISITION ENGINE LOGIC
   ============================================= */

const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/leadyx-generate';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initForm();
  initSlider();
  initCustomIndustry();
  initMobileMenu();
  initSpotsCounter();
});

/* ---- Navbar scroll ---- */
function initNavbar() {
  const nav = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ---- Mobile menu ---- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '60px';
    links.style.right = '16px';
    links.style.background = 'rgba(9,9,11,0.95)';
    links.style.padding = '16px 24px';
    links.style.borderRadius = '12px';
    links.style.border = '1px solid rgba(255,255,255,0.08)';
    links.style.gap = '16px';
    links.style.backdropFilter = 'blur(20px)';
  });
}

/* ---- Lead count slider ---- */
function initSlider() {
  const slider = document.getElementById('f-leads');
  const display = document.getElementById('lead-count-val');
  if (!slider || !display) return;
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
  });
}

/* ---- Custom industry toggle ---- */
function initCustomIndustry() {
  const select = document.getElementById('f-industry');
  const group = document.getElementById('custom-industry-group');
  if (!select || !group) return;
  select.addEventListener('change', () => {
    group.style.display = select.value === 'Other' ? 'block' : 'none';
  });
}

/* ---- Spots countdown (urgency) ---- */
function initSpotsCounter() {
  const el = document.getElementById('spots-left');
  if (!el) return;
  // Simulate decreasing spots based on day of month
  const day = new Date().getDate();
  const spots = Math.max(3, 50 - day);
  el.textContent = spots;
}

/* ---- Scroll reveal ---- */
function initReveal() {
  const targets = document.querySelectorAll(
    '.step-card, .results-wrapper, .form-card, .sidebar-card, .price-card, .testimonial-card, .cta-card, .sec-header'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('vis'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  targets.forEach((el) => obs.observe(el));
}

/* ---- Form submission ---- */
function initForm() {
  const form = document.getElementById('lead-form');
  const btn = document.getElementById('submit-btn');
  const defSpan = btn.querySelector('.sb-default');
  const loadSpan = btn.querySelector('.sb-loading');
  const resEl = document.getElementById('response');
  const resIcon = document.getElementById('res-icon');
  const resTitle = document.getElementById('res-title');
  const resMsg = document.getElementById('res-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = form.city.value;
    const biz = form.business_type.value === 'Other'
      ? form.custom_industry?.value?.trim() || ''
      : form.business_type.value;
    const name = form.client_name.value.trim();
    const email = form.client_email.value.trim();
    const phone = form.client_phone.value.trim();
    const leadCount = form.lead_count?.value || '20';

    // Friendly validation
    if (!city) {
      showResponse('warn', '[!]', 'Please select a city', 'Choose the city where you want to find leads.');
      return;
    }
    if (!biz) {
      showResponse('warn', '[!]', 'Please select an industry', 'Tell us what kind of businesses you\'re looking for.');
      return;
    }
    if (!name) {
      showResponse('warn', '[!]', 'Please enter your name', 'We need your name to set up your account.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showResponse('warn', '[!]', 'Please enter a valid email', 'We\'ll send your lead report to this address.');
      return;
    }
    if (!phone) {
      showResponse('warn', '[!]', 'Please enter your WhatsApp number', 'We\'ll notify you when your leads are ready.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          business_type: biz,
          client_name: name,
          client_email: email,
          client_phone: phone,
          lead_count: parseInt(leadCount, 10),
          plan: 'free_trial'
        }),
      });

      if (res.ok || res.status === 202) {
        showResponse('ok', '[✓]', 'Your leads are being generated!',
          `We're finding ${leadCount} ${biz} leads in ${city} for you. You'll receive an email at ${email} and a WhatsApp message within 2 hours with your dashboard access.`);
        form.reset();
        document.getElementById('lead-count-val').textContent = '20';
      } else {
        showResponse('fail', '[✗]', 'Something went wrong',
          'Our system is experiencing high demand. Please try again in a few minutes, or contact us at hello@leadyx.in');
      }
    } catch (err) {
      showResponse('fail', '[~]', 'System is starting up...',
        'Our servers are warming up. This usually takes 10–20 seconds. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(on) {
    btn.disabled = on;
    defSpan.hidden = on;
    loadSpan.hidden = !on;
  }

  function showResponse(type, icon, title, msg) {
    resEl.hidden = false;
    resEl.style.animation = 'none';
    void resEl.offsetHeight;
    resEl.style.animation = 'fadeUp 0.4s var(--ease)';

    const inner = document.getElementById('response-inner');
    const colors = {
      ok: 'var(--green)',
      fail: 'var(--amber)',
      warn: 'var(--amber)'
    };

    resIcon.textContent = icon;
    resTitle.textContent = title;
    resTitle.style.color = colors[type] || 'var(--text-0)';
    resMsg.textContent = msg;

    if (type === 'ok') {
      inner.style.background = 'rgba(57,255,20,0.04)';
      inner.style.borderRadius = '12px';
      inner.style.padding = '20px';
    } else {
      inner.style.background = 'rgba(245,158,11,0.04)';
      inner.style.borderRadius = '12px';
      inner.style.padding = '20px';
    }

    resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
