(() => {
  const storageKey = 'ca-articles-v1';
  const retiredLawType = ['Family', 'law'].join(' ');
  const lawTypes = ['Administration of estates', 'Commercial and corporate law', 'Commercial litigation', 'Franchise agreements', 'Labour law', 'Landlord and tenant', 'Property law', 'General legal'];
  const legacyLawTypes = {
    'regulation-910': 'Administration of estates',
    'trusts-divorce': 'General legal',
    'constitutional-court': 'General legal',
    'section-129': 'Commercial litigation',
    'maintenance-defaulters': 'General legal',
  };
  const originalArticles = [
    { id: 'regulation-910', title: 'Regulation 910, only you can be my agent!', author: 'Alessia Ryan', lawType: 'Administration of estates', date: '2018-09-28', description: 'Regulation 910 of the Attorneys Act stipulates that, in the event of deceased estates, only an attorney, trust company or auditor can be appointed as executor.', image: '../assets/images/article-regulation-910.png', imageAlt: 'Estate file, fountain pen and justice scales', link: 'https://chrisart.co.za/regulation-910-only-you-can-be-my-agent/', pdfData: '', pdfName: '', status: 'published' },
    { id: 'trusts-divorce', title: 'Trusts, Divorce, Accrual and Assets', author: 'Alessia Ryan', lawType: 'General legal', date: '2018-06-22', description: 'Taken from Trusts & Divorces Seminar by Ceris Field. In the recent Supreme Court of Appeal matter of REM v VM, the Court considered trust assets and accrual.', image: '../assets/images/article-trusts-divorce.png', imageAlt: 'Wedding rings beside a legal agreement', link: 'https://chrisart.co.za/trusts-divorce-accrual-and-assets/', pdfData: '', pdfName: '', status: 'published' },
    { id: 'constitutional-court', title: 'Constitutional Court reaffirms that the courts will guard the rights & interests of children in South Africa', author: 'Harry Hadjiyannis', lawType: 'General legal', date: '2018-05-07', description: 'It may be the case that a maintenance obligated party, as per a court order, disputes the specific terms of such an order.', image: '../assets/images/article-constitutional-court.png', imageAlt: 'Courthouse columns and a bench', link: 'https://chrisart.co.za/constitutional-court-reaffirms-that-the-courts-will-guard-the-rights-interests-of-children-in-south-africa/', pdfData: '', pdfName: '', status: 'published' },
    { id: 'section-129', title: 'Section 129 Notices and the issue of jurisdiction', author: 'Claudia Bragazzi, Candidate Attorney', lawType: 'Commercial litigation', date: '2018-03-13', description: 'In Blue Chip 2 (Pty) Ltd v Rynedelt, the Supreme Court of Appeal considered delivery of a notice in terms of Section 129(1)(a) of the National Credit Act.', image: '../assets/images/article-section-129.png', imageAlt: 'Formal legal notice in an envelope', link: 'https://chrisart.co.za/section-129-notices-and-the-issue-of-jurisdiction/', pdfData: '', pdfName: '', status: 'published' },
    { id: 'maintenance-defaulters', title: 'Maintenance defaulters beware!', author: 'Alessia Ryan', lawType: 'General legal', date: '2018-01-31', description: 'With effect from 5 January 2018, sections 2, 11 and 13(b) of the Maintenance Amendment Act will be operationalised.', image: '../assets/images/article-maintenance-enforcement.png', imageAlt: 'Court order folder with a fountain pen and justice scales', link: 'https://chrisart.co.za/maintenance-defaulters-beware/', pdfData: '', pdfName: '', status: 'published' },
  ];

  const form = document.getElementById('article-form');
  if (!form) return;

  const fields = {
    id: document.getElementById('article-id'),
    title: document.getElementById('article-title'),
    author: document.getElementById('article-author'),
    lawType: document.getElementById('article-law-type'),
    date: document.getElementById('article-date'),
    status: document.getElementById('article-status'),
    description: document.getElementById('article-description'),
    link: document.getElementById('article-link'),
    pdf: document.getElementById('article-pdf'),
    image: document.getElementById('article-image'),
    imageAlt: document.getElementById('article-image-alt'),
  };
  const heading = document.getElementById('article-form-heading');
  const submitLabel = document.getElementById('article-submit-label');
  const cancelButton = document.getElementById('article-form-cancel');
  const restoreButton = document.getElementById('restore-original-articles');
  const list = document.getElementById('cms-article-list');
  const summary = document.getElementById('article-list-summary');
  const formStatus = document.getElementById('article-form-status');
  const preview = document.getElementById('article-image-preview');
  const previewImage = document.getElementById('article-image-preview-image');
  const previewCaption = document.getElementById('article-image-preview-caption');
  const pdfSelection = document.getElementById('article-pdf-selection');
  const pdfName = document.getElementById('article-pdf-name');
  const pdfRemoveButton = document.getElementById('article-pdf-remove');
  let selectedImage = '';
  let selectedPdf = { data: '', name: '' };

  const normaliseArticle = (article) => {
    const requestedLawType = article.lawType === retiredLawType ? 'General legal' : article.lawType || legacyLawTypes[article.id] || (article.category !== 'Publication' ? article.category : '');
    return {
      ...article,
      lawType: lawTypes.includes(requestedLawType) ? requestedLawType : 'General legal',
      pdfData: article.pdfData || '',
      pdfName: article.pdfName || '',
    };
  };
  const cloneOriginals = () => originalArticles.map((article) => normaliseArticle({ ...article }));
  const getArticles = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return cloneOriginals();
      const articles = JSON.parse(stored);
      return Array.isArray(articles) ? articles.map(normaliseArticle) : cloneOriginals();
    } catch (error) {
      return cloneOriginals();
    }
  };
  const saveArticles = (articles) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(articles.map(normaliseArticle)));
      return true;
    } catch (error) {
      setStatus('Your browser could not save this article. Try a smaller image or PDF, or enable site storage.', true);
      return false;
    }
  };
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const formatDate = (date) => new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const uniqueId = () => (window.crypto?.randomUUID?.() || `article-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const setStatus = (message, isError = false) => {
    formStatus.textContent = message;
    formStatus.classList.toggle('is-error', isError);
  };
  const getError = (field) => form.querySelector(`[data-error-for="${field.id}"]`);
  const setFieldState = (field, message = '') => {
    const error = getError(field);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  };
  const clearErrors = () => form.querySelectorAll('.cms-field-error').forEach((error) => { error.textContent = ''; });
  const showPreview = (image, alt) => {
    if (!image) { preview.hidden = true; return; }
    previewImage.src = image;
    previewImage.alt = alt || '';
    previewCaption.textContent = alt || 'Featured image preview';
    preview.hidden = false;
  };
  const showPdfSelection = () => {
    const hasPdf = Boolean(selectedPdf.data);
    pdfSelection.hidden = !hasPdf;
    pdfName.textContent = hasPdf ? selectedPdf.name : '';
  };
  const validate = () => {
    const required = [fields.title, fields.author, fields.lawType, fields.date, fields.description, fields.imageAlt];
    const valid = required.map((field) => setFieldState(field, field.value.trim() ? '' : 'This field is required.'));
    if (fields.link.value.trim() && !fields.link.validity.valid) valid.push(setFieldState(fields.link, 'Enter a complete URL, including https://.'));
    else setFieldState(fields.link);
    const hasImage = selectedImage || Boolean(fields.id.value);
    valid.push(setFieldState(fields.image, hasImage ? '' : 'Add a featured image before saving.'));
    return valid.every(Boolean);
  };
  const compressImage = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Please choose an image file.')); return; }
    if (file.size > 8 * 1024 * 1024) { reject(new Error('Choose an image smaller than 8 MB.')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  const readPdf = (file) => new Promise((resolve, reject) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { reject(new Error('Please choose a PDF file.')); return; }
    if (file.size > 2 * 1024 * 1024) { reject(new Error('Choose a PDF smaller than 2 MB.')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected PDF could not be read.'));
    reader.onload = () => resolve({ data: reader.result, name: file.name });
    reader.readAsDataURL(file);
  });
  const render = () => {
    const articles = getArticles().sort((a, b) => b.date.localeCompare(a.date));
    const published = articles.filter((article) => article.status === 'published').length;
    summary.textContent = `${articles.length} ${articles.length === 1 ? 'article' : 'articles'} · ${published} published`;
    list.innerHTML = articles.length ? articles.map((article) => `<article class="cms-article-row"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" /><div class="cms-article-details"><div class="cms-article-title-row"><p class="publication-category">${escapeHtml(article.lawType)}</p><span class="cms-status cms-status-${article.status === 'published' ? 'published' : 'draft'}">${escapeHtml(article.status)}</span></div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.author)} <span aria-hidden="true">·</span> <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>${article.pdfData ? ' <span aria-hidden="true">·</span> <i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF' : ''}</p></div><div class="cms-row-actions"><button class="cms-icon-button" type="button" data-edit-article="${escapeHtml(article.id)}" aria-label="Edit ${escapeHtml(article.title)}"><i class="fa-solid fa-pen" aria-hidden="true"></i><span>Edit</span></button><button class="cms-icon-button cms-delete-button" type="button" data-delete-article="${escapeHtml(article.id)}" aria-label="Delete ${escapeHtml(article.title)}"><i class="fa-solid fa-trash" aria-hidden="true"></i><span>Delete</span></button></div></article>`).join('') : '<p class="cms-empty-state">No articles yet. Add your first article using the editor.</p>';
  };
  const resetEditor = () => {
    form.reset();
    fields.id.value = '';
    selectedImage = '';
    selectedPdf = { data: '', name: '' };
    preview.hidden = true;
    showPdfSelection();
    clearErrors();
    setStatus('');
    heading.textContent = 'Add an article';
    submitLabel.textContent = 'Save article';
    cancelButton.hidden = true;
  };
  const editArticle = (id) => {
    const article = getArticles().find((item) => item.id === id);
    if (!article) return;
    fields.id.value = article.id;
    fields.title.value = article.title;
    fields.author.value = article.author;
    fields.lawType.value = article.lawType;
    fields.date.value = article.date;
    fields.status.value = article.status || 'published';
    fields.description.value = article.description;
    fields.link.value = article.link || '';
    fields.imageAlt.value = article.imageAlt || '';
    selectedImage = article.image;
    selectedPdf = { data: article.pdfData || '', name: article.pdfName || 'Article PDF' };
    showPreview(article.image, article.imageAlt);
    showPdfSelection();
    heading.textContent = 'Edit article';
    submitLabel.textContent = 'Update article';
    cancelButton.hidden = false;
    clearErrors();
    setStatus(`Editing “${article.title}”.`);
    form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    fields.title.focus();
  };

  fields.image.addEventListener('change', async () => {
    const file = fields.image.files?.[0];
    if (!file) return;
    try {
      setStatus('Preparing image…');
      selectedImage = await compressImage(file);
      showPreview(selectedImage, fields.imageAlt.value);
      setFieldState(fields.image);
      setStatus('Image ready to save.');
    } catch (error) {
      selectedImage = '';
      fields.image.value = '';
      setFieldState(fields.image, error.message);
      setStatus(error.message, true);
    }
  });
  fields.pdf.addEventListener('change', async () => {
    const file = fields.pdf.files?.[0];
    if (!file) return;
    try {
      setStatus('Preparing PDF…');
      selectedPdf = await readPdf(file);
      showPdfSelection();
      setFieldState(fields.pdf);
      setStatus('PDF ready to save.');
    } catch (error) {
      selectedPdf = { data: '', name: '' };
      fields.pdf.value = '';
      showPdfSelection();
      setFieldState(fields.pdf, error.message);
      setStatus(error.message, true);
    }
  });
  pdfRemoveButton.addEventListener('click', () => {
    selectedPdf = { data: '', name: '' };
    fields.pdf.value = '';
    showPdfSelection();
    setFieldState(fields.pdf);
    setStatus('PDF removed. Save the article to keep this change.');
  });
  fields.imageAlt.addEventListener('input', () => { if (selectedImage) showPreview(selectedImage, fields.imageAlt.value); });
  [fields.title, fields.author, fields.lawType, fields.date, fields.description, fields.imageAlt, fields.link].forEach((field) => field.addEventListener('blur', () => validate()));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) {
      setStatus('Please correct the highlighted fields.', true);
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const articles = getArticles();
    const isEditing = Boolean(fields.id.value);
    const article = {
      id: fields.id.value || uniqueId(), title: fields.title.value.trim(), author: fields.author.value.trim(), lawType: fields.lawType.value, date: fields.date.value,
      status: fields.status.value, description: fields.description.value.trim(), link: fields.link.value.trim(), pdfData: selectedPdf.data, pdfName: selectedPdf.name, image: selectedImage, imageAlt: fields.imageAlt.value.trim(),
    };
    const nextArticles = isEditing ? articles.map((item) => item.id === article.id ? article : item) : [article, ...articles];
    if (!saveArticles(nextArticles)) return;
    render();
    resetEditor();
    setStatus(isEditing ? 'Article updated successfully.' : 'Article added successfully.');
  });
  list.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit-article]');
    const remove = event.target.closest('[data-delete-article]');
    if (edit) editArticle(edit.dataset.editArticle);
    if (remove) {
      const articles = getArticles();
      const article = articles.find((item) => item.id === remove.dataset.deleteArticle);
      if (!article || !window.confirm(`Delete “${article.title}”? This cannot be undone in this browser.`)) return;
      if (saveArticles(articles.filter((item) => item.id !== article.id))) {
        render();
        if (fields.id.value === article.id) resetEditor();
        setStatus('Article deleted.');
      }
    }
  });
  cancelButton.addEventListener('click', resetEditor);
  restoreButton.addEventListener('click', () => {
    if (!window.confirm('Restore the original publications? Any articles added or edited in this browser will be removed.')) return;
    if (saveArticles(cloneOriginals())) { render(); resetEditor(); setStatus('Original publications restored.'); }
  });

  if (!localStorage.getItem(storageKey)) saveArticles(cloneOriginals());
  else saveArticles(getArticles());
  render();
})();
