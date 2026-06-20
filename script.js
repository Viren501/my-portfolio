/**
 * script.js — Viren Vairagi Portfolio
 * =====================================
 * Sections:
 *   1. Hero Canvas  — Animated dot-matrix background (signature element)
 *   2. Navbar       — Scroll-triggered glass effect
 *   3. Mobile Nav   — Hamburger toggle & drawer
 *   4. Scroll Reveal — IntersectionObserver-based reveal animations
 *   5. Back to Top  — Floating button visibility & click
 *   6. Contact Form — Client-side validation + mailto handler
 */


/* =====================================================================
   1. HERO CANVAS
   Renders a pulsing dot-matrix grid on the <canvas id="hero-canvas">.
   Dots alternate between cyan and violet, pulse at different rates, and
   create an ambient "circuit / data" atmosphere behind the hero text.
===================================================================== */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const CYAN   = '#00C2FF';
  const VIOLET = '#7B61FF';
  const GAP    = 36;   // px between grid nodes

  let cols, rows, dots, W, H, rafId;

  /** Build the full set of dot objects sized to the current viewport. */
  function buildDots() {
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x:     c * GAP,
          y:     r * GAP,
          base:  Math.random(),
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.5,
          color: Math.random() > 0.7 ? VIOLET : CYAN,
        });
      }
    }
  }

  /** Match canvas resolution to its rendered CSS size. */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cols = Math.ceil(W / GAP) + 1;
    rows = Math.ceil(H / GAP) + 1;
    buildDots();
  }

  let t = 0;

  /** Main animation loop. */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    for (const d of dots) {
      const pulse = d.base * 0.5 + 0.3 + Math.sin(t * d.speed + d.phase) * 0.25;
      const r     = Math.max(0.3, pulse * 2.2);

      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle  = d.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, pulse * 0.9));
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  // Pause when the tab is hidden to save CPU / battery.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      draw();
    }
  });

  // Debounce resize so we don't thrash on every pixel.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  draw();
})();


/* =====================================================================
   2. NAVBAR — Scroll-triggered glass / shadow effect
===================================================================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case user refreshes mid-page
})();


/* =====================================================================
   3. MOBILE NAV — Hamburger toggle + drawer open/close
===================================================================== */
(function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;

  /** Open or close the drawer. */
  function setDrawer(open) {
    drawer.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
  }

  // Hamburger button click
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setDrawer(!drawer.classList.contains('open'));
  });

  // Click on any drawer link → close
  drawer.querySelectorAll('.drawer-link').forEach((link) => {
    link.addEventListener('click', () => setDrawer(false));
  });

  // Click anywhere outside the nav → close
  document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target) && !drawer.contains(e.target)) {
      setDrawer(false);
    }
  });

  // Escape key → close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false);
  });
})();


/* =====================================================================
   4. SCROLL REVEAL
   Uses IntersectionObserver to add the `.visible` class when elements
   with `.reveal` or `.reveal-stagger` enter the viewport.
===================================================================== */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
})();


/* =====================================================================
   5. BACK TO TOP
   Shows the button after 400 px of scroll and scrolls to top on click.
===================================================================== */
(function initBackToTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  function onScroll() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* =====================================================================
   6. CONTACT FORM — Validation + mailto handler
   Validates name, email, and message fields, then opens the user's
   default mail client with a pre-filled message via `mailto:`.
===================================================================== */
(function initContactForm() {
  const sendBtn = document.getElementById('send-btn');
  if (!sendBtn) return;

  /** Naive but sufficient email format check. */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Highlight a field as invalid and return false, or clear and return true. */
  function validate(field, condition) {
    if (!condition) {
      field.style.borderColor = '#FF5B6B';
      field.focus();
      return false;
    }
    field.style.borderColor = '';
    return true;
  }

  sendBtn.addEventListener('click', () => {
    const nameEl    = document.getElementById('contact-name');
    const emailEl   = document.getElementById('contact-email');
    const subjectEl = document.getElementById('contact-subject');
    const messageEl = document.getElementById('contact-message');

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const subject = subjectEl.value.trim();
    const message = messageEl.value.trim();

    // Validate — stop at first failure
    if (!validate(nameEl, name.length > 0))       return;
    if (!validate(emailEl, isValidEmail(email)))   return;
    if (!validate(messageEl, message.length > 0))  return;

    // Change button state to show loading
const originalBtnText = sendBtn.innerHTML;
sendBtn.innerHTML = ' Sending...';
sendBtn.style.pointerEvents = 'none'; // Prevent double clicks

// Send data to Web3Forms API
fetch('https://api.web3forms.com/submit', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Accept': 'application/json'
},
body: JSON.stringify({
// REPLACE THIS WITH THE KEY SENT TO YOUR EMAIL
access_key: '70794dcc-1e93-4ea8-9efc-196cf48c7df7', 
name: name,
email: email,
subject: subject || 'Portfolio Enquiry from Website',
message: message
})
})
.then(async (response) => {
if (response.status === 200) {
// Success: Show checkmark and clear the form
sendBtn.innerHTML = ' Message Sent!';
sendBtn.style.backgroundColor = '#00E682'; // Turn button green
nameEl.value = ''; 
emailEl.value = ''; 
subjectEl.value = ''; 
messageEl.value = '';
} else {
// API Error
sendBtn.innerHTML = ' Something went wrong';
sendBtn.style.backgroundColor = '#FF5B6B'; // Turn button red
}
})
.catch((error) => {
// Network Error
sendBtn.innerHTML = ' Network Error';
sendBtn.style.backgroundColor = '#FF5B6B';
})
.finally(() => {
// Reset the button back to normal after 3 seconds
setTimeout(() => {
sendBtn.innerHTML = originalBtnText;
sendBtn.style.backgroundColor = '';
sendBtn.style.pointerEvents = 'auto';
}, 3000);
});
  });
})();
