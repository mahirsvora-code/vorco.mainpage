const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Force fresh stylesheet and red-line placement, even if an old HTML page is cached.
const styleLink = document.querySelector('link[rel="stylesheet"][href="styles.css"]');
if (styleLink) {
  styleLink.setAttribute('href', 'styles.css?v=20260413');
}

const redLineFix = document.createElement('style');
redLineFix.textContent = `.hero::after{right:0!important;top:auto!important;bottom:-8px!important;width:min(28vw,320px)!important;height:8px!important;transform:none!important;z-index:0!important;}`;
document.head.appendChild(redLineFix);

window.addEventListener('load', () => {
  if (prefersReducedMotion) {
    body.classList.add('page-ready');
    document.querySelectorAll('.section-fade').forEach((el) => el.classList.add('is-visible'));
    return;
  }
  body.classList.add('page-ready');
});

const onScroll = () => {
  if (!header) return;
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    });
  });
}

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
const isWorkView = currentPage === 'index.html' && (window.location.hash === '#work' || window.location.search.includes('view=work'));
if (currentPage === 'index.html' && !window.location.hash && !window.location.search) {
  window.location.replace('about.html');
}
const navLinks = document.querySelectorAll('.site-nav a');
navLinks.forEach((link) => {
  const href = (link.getAttribute('href') || '').toLowerCase();
  const isProduct = currentPage === 'product.html' && href.startsWith('product.html');
  const isAbout = currentPage === 'about.html' && href.startsWith('about.html');
  const isContact = currentPage === 'contact.html' && href.startsWith('contact.html');
  const isWork = isWorkView && (href.startsWith('index.html?view=work') || href.startsWith('index.html#work'));
  if (isProduct || isAbout || isContact || isWork) {
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
  }
});

const fadeTargets = document.querySelectorAll('.section-fade');
if (!prefersReducedMotion && 'IntersectionObserver' in window && fadeTargets.length > 0) {
  fadeTargets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index * 55, 260)}ms`;
  });

  const fadeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  fadeTargets.forEach((target) => fadeObserver.observe(target));
} else {
  fadeTargets.forEach((target) => target.classList.add('is-visible'));
}

const allTabs = document.querySelectorAll('[data-tab-group]');
allTabs.forEach((group) => {
  const tabs = group.querySelectorAll('.tab');
  const panels = group.querySelectorAll('.tab-panel');

  const activateTab = (tab) => {
    const id = tab.dataset.tab;

    tabs.forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });

    panels.forEach((panel) => {
      panel.classList.remove('is-active');
    });

    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');

    const panel = group.querySelector(`.tab-panel[data-panel="${id}"]`);
    if (panel) panel.classList.add('is-active');
  };

  tabs.forEach((tab, index) => {
    tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      activateTab(nextTab);
      nextTab.focus();
    });
  });
});

const statValues = document.querySelectorAll('.stat-value[data-count-to]');
if (!prefersReducedMotion && statValues.length > 0 && 'IntersectionObserver' in window) {
  const formatNumber = (value) => Math.round(value).toString();

  const animateCounter = (el) => {
    const target = Number(el.dataset.countTo || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${formatNumber(target * eased)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  statValues.forEach((el) => statObserver.observe(el));
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const status = contactForm.querySelector('.form-status');
    const original = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.textContent = 'Sending...';
      submitButton.setAttribute('disabled', 'true');
    }

    if (status) {
      status.textContent = '';
    }

    fetch(contactForm.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: new FormData(contactForm),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Form submission failed');
        }

        if (status) {
          status.textContent = 'Message sent. We will reply by email.';
        }

        contactForm.reset();
      })
      .catch(() => {
        if (status) {
          status.textContent = 'Something went wrong. Please email mahirsvora@gmail.com directly.';
        }
      })
      .finally(() => {
        if (submitButton) {
          submitButton.textContent = original;
          submitButton.removeAttribute('disabled');
        }
      });
  });
}
