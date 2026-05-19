/* =============================================
   LEADYX — APP LOGIC (MARKETING SPA)
   ============================================= */

// ---- CONFIG: API Endpoint (Abstracted) ----
const API_ENDPOINT = 'https://api.leadyx.com/v1/engine/start';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initReveal();
  initForm();
  initRouter();
  initContactForm();
});

/* ---- SPA Router ---- */
function initRouter() {
  const views = document.querySelectorAll('.view');
  const links = document.querySelectorAll('a[href^="#"]');

  function navigate(hash) {
    if (!hash || hash === '#') hash = '#home';
    const route = hash.replace('#', '');
    
    // Define main views
    const mainViews = ['home', 'about', 'pricing', 'contact'];
    // Define sections within home that should just scroll
    const homeSections = ['capabilities', 'pipeline', 'terminal'];

    let targetViewId = 'view-home';
    if (mainViews.includes(route)) {
      targetViewId = 'view-' + route;
    } else if (homeSections.includes(route)) {
      targetViewId = 'view-home';
    }

    // Hide all views
    views.forEach(v => {
      v.style.display = 'none';
      v.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.style.display = 'block';
      // Slight delay to allow CSS display:block to apply before opacity transition
      setTimeout(() => {
        targetView.classList.add('active');
        // Re-trigger scroll animations for the new view
        initReveal();
        
        // Handle scrolling
        if (homeSections.includes(route)) {
           const section = document.getElementById(route);
           if (section) {
               section.scrollIntoView({ behavior: 'smooth' });
           }
        } else {
           window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }

    // Update active state in nav
    document.querySelectorAll('.nav-links a').forEach(l => {
      const linkHash = l.getAttribute('href').replace('#', '');
      if (linkHash === route || (homeSections.includes(route) && linkHash === 'home')) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  }

  window.addEventListener('hashchange', () => navigate(window.location.hash));
  
  // Handle click on links manually to prevent default jump if we want smooth transitions
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if(href.startsWith('#')) {
          e.preventDefault();
          history.pushState(null, null, href);
          navigate(href);
      }
    });
  });

  // Initial load
  navigate(window.location.hash);
}


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


/* ---- Animated stat counters ---- */
function initCounters() {
  const els = document.querySelectorAll('.stat-num[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countUp(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach((el) => obs.observe(el));
}

function countUp(el) {
  if (el.dataset.counted) return; // prevent recounting on view swap
  el.dataset.counted = "true";
  
  const target = parseInt(el.dataset.count, 10);
  const duration = 2200;
  const start = performance.now();
  const label = el.closest('.stat-block')?.querySelector('.stat-lbl')?.textContent || '';

  function ease(t) { return 1 - Math.pow(1 - t, 4); }

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const val = Math.round(ease(t) * target);
    el.textContent = val.toLocaleString();
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (target >= 1000) el.textContent = target.toLocaleString() + '+';
      else if (label.includes('%')) el.textContent = target + '%';
    }
  }
  requestAnimationFrame(step);
}


/* ---- Scroll reveal ---- */
function initReveal() {
  const targets = document.querySelectorAll(
    '.cap-card, .pipe-step, .sys-card, .term-window, .sec-header, .about-card, .pricing-card, .contact-layout'
  );
  
  targets.forEach((el) => {
      el.classList.add('reveal');
      el.classList.remove('vis'); // reset for re-triggering
  });

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


/* ---- Engine Terminal Form ---- */
function initForm() {
  const form = document.getElementById('lead-form');
  if(!form) return;
  const btn = document.getElementById('submit-btn');
  const defSpan = btn.querySelector('.eb-default');
  const loadSpan = btn.querySelector('.eb-loading');
  const resEl = document.getElementById('response');
  const resIcon = document.getElementById('res-icon');
  const resTitle = document.getElementById('res-title');
  const resMsg = document.getElementById('res-msg');
  const resDet = document.getElementById('res-details');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = form.city.value.trim();
    const biz = form.business_type.value.trim();
    const cid = form.client_id.value.trim();
    const plan = form.plan.value;

    // Validation
    if (!city || !biz || !cid) {
      show('fail', 'ERR: MISSING_PARAMETERS', 'Required parameters missing. Provide --city, --industry, and --client-id.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{4,64}$/.test(cid)) {
      show('fail', 'ERR: INVALID_IDENTIFIER', 'Client ID must be 4–64 characters: [a-zA-Z0-9_]');
      return;
    }

    setLoading(true);

    try {
      // Simulate network request for the demo instead of actually hitting the webhook
      // since the webhook is abstracted away for security/marketing purposes
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const simulatedData = {
          status: "accepted",
          job_id: "ldx_" + Math.random().toString(36).substr(2, 9),
          estimated_leads: Math.floor(Math.random() * 500) + 100,
          eta: "2m 45s",
          destination: "Secure Cloud Vault"
      };

      show('ok', 'SUCCESS: ENGINE_INITIALIZED', `Job accepted. Engine actively crawling target sectors. Results routing to dashboard.`, simulatedData);
      
    } catch (err) {
      show('fail', 'ERR: CONNECTION_REFUSED', `Could not establish connection to LEADYX core. Engine might be under high load.\n${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(on) {
    btn.disabled = on;
    defSpan.hidden = on;
    loadSpan.hidden = !on;
  }

  function show(type, title, msg, details) {
    resEl.hidden = false;
    resEl.style.animation = 'none';
    void resEl.offsetHeight;
    resEl.style.animation = 'fadeUp 0.4s var(--ease)';

    resIcon.textContent = type === 'ok' ? '✓' : '✗';
    resIcon.style.color = type === 'ok' ? 'var(--green)' : 'var(--hot)';
    resTitle.textContent = title;
    resTitle.style.color = type === 'ok' ? 'var(--green)' : 'var(--hot)';
    resMsg.textContent = msg;

    if (details) {
      resDet.hidden = false;
      resDet.textContent = JSON.stringify(details, null, 2);
    } else {
      resDet.hidden = true;
    }

    resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ---- Generic Contact Form handler ---- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if(!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const origText = btn.textContent;
        
        btn.textContent = "Sending...";
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = "Message Sent!";
            btn.style.background = "var(--green)";
            form.reset();
            
            setTimeout(() => {
                btn.textContent = origText;
                btn.style.background = "";
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}
