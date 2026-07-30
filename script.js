(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const revealItems = document.querySelectorAll('.reveal');
  const parallaxImages = document.querySelectorAll('.parallax-image');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('current-year').textContent = new Date().getFullYear();

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton.addEventListener('click', () => {
    const opened = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!opened));
    menuButton.setAttribute('aria-label', opened ? 'Open navigation menu' : 'Close navigation menu');
    mobileMenu.setAttribute('aria-hidden', String(opened));
    mobileMenu.classList.toggle('open', !opened);
    document.body.style.overflow = opened ? '' : 'hidden';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 8) * 45, 220)}ms`;
      observer.observe(item);
    });

    const parallax = () => {
      parallaxImages.forEach((image) => {
        const rect = image.getBoundingClientRect();
        const movement = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.035;
        image.style.transform = `translateY(${movement}px) scale(1.22)`;
      });
    };
    parallax();
    window.addEventListener('scroll', parallax, { passive: true });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
