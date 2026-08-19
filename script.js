(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const revealItems = document.querySelectorAll('.reveal');
  const parallaxImages = document.querySelectorAll('.parallax-image');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const localContactPath = document.querySelector('link[href="styles.css"]') ? 'contact-us/' : '../contact-us/';

  document.querySelectorAll('a[href="https://chrisart.co.za/contact-us/"]').forEach((link) => {
    link.setAttribute('href', localContactPath);
  });

  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = new Date().getFullYear();

  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 10);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  if (menuButton && mobileMenu) {
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
  }

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
        const scale = image.classList.contains('hero-image') ? 1.05 : 1.22;
        image.style.transform = `translateY(${movement}px) scale(${scale})`;
      });
    };
    parallax();
    window.addEventListener('scroll', parallax, { passive: true });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const expertiseTabs = Array.from(document.querySelectorAll('[data-expertise-tab]'));
  const expertisePanels = Array.from(document.querySelectorAll('[data-expertise-panel]'));

  if (expertiseTabs.length && expertisePanels.length) {
    document.body.classList.add('tabs-ready');
    const validSlugs = new Set(expertiseTabs.map((tab) => tab.dataset.expertiseTab));

    const activateExpertise = (slug, updateHash = true, moveFocus = false) => {
      const selectedSlug = validSlugs.has(slug) ? slug : expertiseTabs[0].dataset.expertiseTab;
      expertiseTabs.forEach((tab) => {
        const selected = tab.dataset.expertiseTab === selectedSlug;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && moveFocus) tab.focus();
      });
      expertisePanels.forEach((panel) => {
        const selected = panel.dataset.expertisePanel === selectedSlug;
        panel.hidden = !selected;
        panel.classList.remove('is-entering');
        if (selected && !reduceMotion) {
          requestAnimationFrame(() => panel.classList.add('is-entering'));
        }
      });
      if (updateHash && window.location.hash !== `#${selectedSlug}`) {
        window.history.replaceState(null, '', `#${selectedSlug}`);
      }
    };

    const initialSlug = window.location.hash.slice(1);
    activateExpertise(initialSlug, false);

    expertiseTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateExpertise(tab.dataset.expertiseTab));
      tab.addEventListener('keydown', (event) => {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % expertiseTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + expertiseTabs.length) % expertiseTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = expertiseTabs.length - 1;
        activateExpertise(expertiseTabs[nextIndex].dataset.expertiseTab, true, true);
      });
    });

    window.addEventListener('hashchange', () => activateExpertise(window.location.hash.slice(1), false));
  }

  const publicationSearch = document.getElementById('publication-search');
  document.querySelectorAll('.site-footer a').forEach((link) => {
    if (link.textContent.trim().toLowerCase() === 'privacy policy') link.href = '/privacy-policy/';
    if (link.textContent.trim().toLowerCase() === 'terms & conditions') link.href = '/terms-and-conditions/';
  });
  const publicationSort = document.getElementById('publication-sort');
  const publicationGrid = document.getElementById('publication-grid');
  const publicationStatus = document.getElementById('publication-status');
  const publicationEmpty = document.getElementById('publication-empty');
  const featuredPublication = document.querySelector('[data-featured-publication]');
  const lawFilterContainer = document.querySelector('.publication-law-filter');
  const articleStorageKey = 'ca-articles-v1';
  const retiredPublicationLawType = ['Family', 'law'].join(' ');
  const legacyArticleLawTypes = {
    'regulation-910': 'Administration of estates',
    'trusts-divorce': 'General legal',
    'constitutional-court': 'General legal',
    'section-129': 'Commercial litigation',
    'maintenance-defaulters': 'General legal',
  };
  const publicationLawTypeOrder = ['Administration of estates', 'Commercial and corporate law', 'Commercial litigation', 'Franchise agreements', 'Labour law', 'Landlord and tenant', 'Property law', 'General legal'];
  const escapePublicationHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const formatPublicationDate = (date) => new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const normalisePublicationArticle = (article) => ({
    ...article,
    lawType: article.lawType === retiredPublicationLawType ? 'General legal' : article.lawType || legacyArticleLawTypes[article.id] || (article.category && article.category !== 'Publication' ? article.category : 'General legal'),
  });
  const savedArticles = (() => {
    try {
      const value = localStorage.getItem(articleStorageKey);
      const articles = value ? JSON.parse(value) : null;
      return Array.isArray(articles) ? articles.filter((article) => article.status === 'published').map(normalisePublicationArticle) : null;
    } catch (error) {
      return null;
    }
  })();

  if (savedArticles && publicationGrid && featuredPublication) {
    const pdfObjectUrls = new Map();
    const getPdfObjectUrl = (article) => {
      if (!article.pdfData || !/^data:(?:application\/pdf|application\/octet-stream);base64,/i.test(article.pdfData)) return '';
      if (pdfObjectUrls.has(article.id)) return pdfObjectUrls.get(article.id);
      try {
        const encodedPdf = article.pdfData.slice(article.pdfData.indexOf(',') + 1);
        const binaryPdf = window.atob(encodedPdf);
        const pdfBytes = new Uint8Array(binaryPdf.length);
        for (let index = 0; index < binaryPdf.length; index += 1) pdfBytes[index] = binaryPdf.charCodeAt(index);
        const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        pdfObjectUrls.set(article.id, pdfUrl);
        return pdfUrl;
      } catch (error) {
        return '';
      }
    };
    window.addEventListener('pagehide', () => pdfObjectUrls.forEach((url) => URL.revokeObjectURL(url)), { once: true });
    const articleDestination = (article) => {
      const pdfUrl = getPdfObjectUrl(article);
      if (pdfUrl) return { href: pdfUrl, isPdf: true };
      if (article.link && /^(https?:\/\/|\/|\.\.\/)/.test(article.link)) return { href: article.link, isPdf: false };
      return { href: '', isPdf: false };
    };
    const linkAttributes = (destination) => destination.isPdf ? ' target="_blank" rel="noopener"' : '';
    const imageMarkup = (article, featured = false) => {
      const image = `<img src="${escapePublicationHtml(article.image)}" alt="${escapePublicationHtml(article.imageAlt || '')}" />`;
      const destination = articleDestination(article);
      return destination.href ? `<a class="${featured ? 'featured-publication-image' : 'publication-image'}" href="${escapePublicationHtml(destination.href)}"${linkAttributes(destination)}>${image}</a>` : `<div class="${featured ? 'featured-publication-image' : 'publication-image'}">${image}</div>`;
    };
    const readLink = (article) => {
      const destination = articleDestination(article);
      if (!destination.href) return '';
      const label = destination.isPdf ? 'View PDF' : 'Read article';
      const icon = destination.isPdf ? 'fa-file-pdf' : 'fa-arrow-right';
      return `<a class="text-link" href="${escapePublicationHtml(destination.href)}"${linkAttributes(destination)}>${label} <i class="fa-solid ${icon}" aria-hidden="true"></i></a>`;
    };
    const cardMarkup = (article, featured = false) => {
      const title = escapePublicationHtml(article.title);
      const destination = articleDestination(article);
      const heading = destination.href ? `<a href="${escapePublicationHtml(destination.href)}"${linkAttributes(destination)}>${title}</a>` : title;
      const attributes = `data-publication-card data-law-type="${escapePublicationHtml(article.lawType)}" data-date="${escapePublicationHtml(article.date)}" data-search="${escapePublicationHtml([article.title, article.author, article.lawType, article.description].join(' ').toLowerCase())}"`;
      const copy = `<div class="${featured ? 'featured-publication-copy' : 'publication-card-copy'}"><p class="publication-category">${escapePublicationHtml(article.lawType)}</p><h2>${heading}</h2><p class="publication-meta"><time datetime="${escapePublicationHtml(article.date)}">${formatPublicationDate(article.date)}</time><span>Written by ${escapePublicationHtml(article.author)}</span></p><p>${escapePublicationHtml(article.description)}</p>${readLink(article)}</div>`;
      return `<article class="${featured ? 'featured-publication reveal is-visible' : 'publication-item reveal is-visible'}" ${attributes}>${imageMarkup(article, featured)}${copy}</article>`;
    };
    const orderedArticles = [...savedArticles].sort((a, b) => b.date.localeCompare(a.date));
    const [firstArticle, ...remainingArticles] = orderedArticles;
    if (firstArticle) {
      featuredPublication.outerHTML = cardMarkup(firstArticle, true);
      publicationGrid.innerHTML = remainingArticles.map((article) => cardMarkup(article)).join('');
    } else {
      featuredPublication.remove();
      publicationGrid.innerHTML = '';
    }
    if (lawFilterContainer) {
      const lawTypes = [...new Set(orderedArticles.map((article) => article.lawType).filter(Boolean))].sort((a, b) => {
        const aIndex = publicationLawTypeOrder.indexOf(a);
        const bIndex = publicationLawTypeOrder.indexOf(b);
        return (aIndex === -1 ? publicationLawTypeOrder.length : aIndex) - (bIndex === -1 ? publicationLawTypeOrder.length : bIndex) || a.localeCompare(b);
      });
      lawFilterContainer.innerHTML = `<button type="button" class="filter-button active" data-publication-law-type="all" aria-pressed="true">All law types</button>${lawTypes.map((lawType) => `<button type="button" class="filter-button" data-publication-law-type="${escapePublicationHtml(lawType)}" aria-pressed="false">${escapePublicationHtml(lawType)}</button>`).join('')}`;
    }
  }

  const publicationCards = Array.from(document.querySelectorAll('[data-publication-card]'));
  const publicationFilters = Array.from(document.querySelectorAll('[data-publication-law-type]'));

  if (publicationCards.length && publicationGrid) {
    let selectedLawType = 'all';
    const getVisibleCards = () => publicationCards.filter((card) => !card.hidden);
    const updatePublications = () => {
      const term = publicationSearch?.value.trim().toLowerCase() || '';
      publicationCards.forEach((card, index) => {
        const matchesLawType = selectedLawType === 'all' || card.dataset.lawType === selectedLawType;
        const matchesSearch = !term || card.dataset.search.includes(term);
        const visible = matchesLawType && matchesSearch;
        card.hidden = !visible;
        card.classList.remove('is-filtered-in');
        if (visible && !reduceMotion) {
          card.style.animationDelay = `${Math.min(index * 45, 180)}ms`;
          requestAnimationFrame(() => card.classList.add('is-filtered-in'));
        }
      });
      const visible = getVisibleCards();
      if (publicationStatus) publicationStatus.textContent = `${visible.length} ${visible.length === 1 ? 'publication' : 'publications'} shown`;
      if (publicationEmpty) publicationEmpty.hidden = visible.length !== 0;
    };
    const sortPublications = () => {
      const direction = publicationSort?.value === 'oldest' ? 1 : -1;
      const gridCards = publicationCards.filter((card) => card.parentElement === publicationGrid);
      gridCards.sort((a, b) => direction * a.dataset.date.localeCompare(b.dataset.date));
      gridCards.forEach((card) => publicationGrid.append(card));
      updatePublications();
    };
    publicationFilters.forEach((button) => button.addEventListener('click', () => {
      selectedLawType = button.dataset.publicationLawType;
      publicationFilters.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle('active', active);
        filter.setAttribute('aria-pressed', String(active));
      });
      updatePublications();
    }));
    publicationSearch?.addEventListener('input', updatePublications);
    publicationSort?.addEventListener('change', sortPublications);
    sortPublications();
  }

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const fields = {
      firstName: contactForm.querySelector('#first-name'),
      lastName: contactForm.querySelector('#last-name'),
      phone: contactForm.querySelector('#phone-number'),
      email: contactForm.querySelector('#email-address'),
      message: contactForm.querySelector('#message'),
    };
    const status = contactForm.querySelector('[data-form-status]');
    const backendName = contactForm.querySelector('[data-contact-name]');
    const backendEmail = contactForm.querySelector('[data-contact-email]');
    const backendComment = contactForm.querySelector('[data-contact-comment]');
    const phonePattern = /^[0-9+()\-\s]{7,25}$/;
    const getError = (field) => contactForm.querySelector(`[data-error-for="${field.id}"]`);
    const setFieldState = (field, message = '') => {
      const wrapper = field.closest('.form-field');
      const error = getError(field);
      const invalid = Boolean(message);
      wrapper.classList.toggle('is-invalid', invalid);
      field.setAttribute('aria-invalid', String(invalid));
      if (error) error.textContent = message;
      return !invalid;
    };
    const validateField = (field) => {
      const value = field.value.trim();
      if (!value) return setFieldState(field, 'This field is required.');
      if (field === fields.email && !field.validity.valid) return setFieldState(field, 'Enter a valid email address.');
      if (field === fields.phone && !phonePattern.test(value)) return setFieldState(field, 'Enter a valid phone number.');
      return setFieldState(field);
    };
    Object.values(fields).forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });
    contactForm.addEventListener('submit', (event) => {
      const valid = Object.values(fields).map(validateField).every(Boolean);
      if (!valid) {
        event.preventDefault();
        const firstInvalid = Object.values(fields).find((field) => field.getAttribute('aria-invalid') === 'true');
        firstInvalid?.focus();
        if (status) { status.textContent = 'Please correct the highlighted fields.'; status.classList.remove('is-sending'); }
        return;
      }
      backendName.value = `${fields.firstName.value.trim()} ${fields.lastName.value.trim()}`;
      backendEmail.value = fields.email.value.trim();
      backendComment.value = `Phone number: ${fields.phone.value.trim()}\n\n${fields.message.value.trim()}`;
      if (status) { status.textContent = 'Sending your enquiry to Christelis Artemides Attorneys…'; status.classList.add('is-sending'); }
    });
  }
})();
