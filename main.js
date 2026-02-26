// ============================================================
// MAIN APPLICATION SCRIPT
// Reads SITE_CONFIG and renders all sections dynamically.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check for a draft config from the admin panel preview
  let C = SITE_CONFIG;
  const draft = localStorage.getItem('SITE_CONFIG_DRAFT');
  if (draft) {
    try {
      C = (new Function(draft + '; return SITE_CONFIG;'))();
      // Clear banner dismissal so it shows during preview
      sessionStorage.removeItem('banner-dismissed');
      // Show preview bar at bottom of page so it doesn't cover the banner
      const bar = document.createElement('div');
      bar.id = 'preview-bar';
      bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#4F46E5;color:#fff;text-align:center;padding:10px 16px;font-family:Inter,sans-serif;font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 -4px 12px rgba(0,0,0,0.15);';
      bar.innerHTML = '👁 Previewing unsaved changes. <button onclick="localStorage.removeItem(\'SITE_CONFIG_DRAFT\');location.reload()" style="background:#fff;color:#4F46E5;border:none;padding:4px 12px;border-radius:4px;font-weight:600;cursor:pointer;font-size:13px">Exit Preview</button>';
      document.body.prepend(bar);
    } catch (e) { console.warn('Failed to load draft config:', e); }
  }

  // ── Icon map (Lucide icon names) ────────────────────────────
  const ICON_MAP = {
    bed: 'bed-double',
    bath: 'bath',
    users: 'users',
    wifi: 'wifi',
    car: 'car',
    paw: 'paw-print',
    home: 'home',
    utensils: 'utensils-crossed',
    tree: 'trees',
    mountain: 'mountain',
    star: 'star',
    'star-filled': 'star',
    mail: 'mail',
    phone: 'phone',
    'map-pin': 'map-pin',
    link: 'external-link',
    instagram: 'instagram',
    facebook: 'facebook',
  };

  function iconName(key) {
    return ICON_MAP[key] || key;
  }

  // ── Banner ──────────────────────────────────────────────────
  function initBanner() {
    const { banner } = C;
    const el = document.getElementById('banner');
    if (!banner || !banner.enabled) return;
    if (sessionStorage.getItem('banner-dismissed')) return;

    document.getElementById('banner-message').textContent = banner.message;
    const linkEl = document.getElementById('banner-link');
    if (banner.linkText && banner.link) {
      linkEl.textContent = banner.linkText;
      linkEl.href = banner.link;
    } else {
      linkEl.hidden = true;
    }

    el.hidden = false;
    document.getElementById('site-header').classList.add('header--has-banner');

    // Measure banner height and push the header down
    requestAnimationFrame(() => {
      const height = el.offsetHeight;
      document.documentElement.style.setProperty('--banner-height', height + 'px');
    });

    document.getElementById('banner-close').addEventListener('click', () => {
      el.hidden = true;
      document.getElementById('site-header').classList.remove('header--has-banner');
      document.documentElement.style.removeProperty('--banner-height');
      sessionStorage.setItem('banner-dismissed', '1');
    });
  }

  // ── Navigation ──────────────────────────────────────────────
  function initNav() {
    document.getElementById('nav-logo').textContent = C.propertyName;

    const header = document.getElementById('site-header');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    // Sticky nav
    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile hamburger
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Active link tracking
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav__link');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ── Hero ────────────────────────────────────────────────────
  function initHero() {
    const { hero } = C;
    const heroEl = document.getElementById('hero');

    // Support both single image (backward compat) and array
    const images = Array.isArray(hero.images) ? hero.images : [hero.backgroundImage];

    // Create slides
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'hero__slides';
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'hero__slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url('${src}')`;
      slidesContainer.appendChild(slide);
    });
    heroEl.prepend(slidesContainer);

    // Carousel logic
    if (images.length > 1) {
      let currentSlide = 0;

      // Create dot indicators
      const indicators = document.createElement('div');
      indicators.className = 'hero__indicators';
      images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero__indicator' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        indicators.appendChild(dot);
      });
      heroEl.appendChild(indicators);

      function goToSlide(index) {
        const slides = heroEl.querySelectorAll('.hero__slide');
        const dots = heroEl.querySelectorAll('.hero__indicator');
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
      }

      // Auto-advance every 6 seconds
      setInterval(() => {
        goToSlide((currentSlide + 1) % images.length);
      }, 6000);
    }

    document.getElementById('hero-headline').textContent = hero.headline;
    document.getElementById('hero-subheadline').textContent = hero.subheadline;
    const cta = document.getElementById('hero-cta');
    cta.textContent = hero.ctaText;
    cta.href = hero.ctaLink;
  }

  // ── About ───────────────────────────────────────────────────
  function initAbout() {
    const { about } = C;
    document.getElementById('about-title').textContent = about.title;

    const paragraphs = document.getElementById('about-paragraphs');
    about.paragraphs.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      paragraphs.appendChild(p);
    });

    const highlights = document.getElementById('about-highlights');
    about.highlights.forEach(h => {
      const card = document.createElement('div');
      card.className = 'highlight-card';
      card.innerHTML = `
        <div class="highlight-card__icon">
          <i data-lucide="${iconName(h.icon)}"></i>
        </div>
        <span class="highlight-card__label">${h.label}</span>
      `;
      highlights.appendChild(card);
    });

    document.getElementById('about-image').src = about.image;
  }

  // ── Gallery ─────────────────────────────────────────────────
  let lightboxIndex = 0;

  function initGallery() {
    const { gallery } = C;
    document.getElementById('gallery-title').textContent = gallery.title;

    const grid = document.getElementById('gallery-grid');
    gallery.images.forEach((img, i) => {
      const item = document.createElement('div');
      item.className = 'gallery__item reveal';
      item.innerHTML = `
        <img src="${img.src}" alt="${img.alt}" loading="lazy" />
        <span class="gallery__item-overlay">${img.alt}</span>
      `;
      item.addEventListener('click', () => openLightbox(i));
      grid.appendChild(item);
    });
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const { gallery } = C;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    img.src = gallery.images[index].src;
    img.alt = gallery.images[index].alt;
    caption.textContent = gallery.images[index].alt;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').hidden = true;
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    const total = C.gallery.images.length;
    lightboxIndex = (lightboxIndex + dir + total) % total;
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    img.src = C.gallery.images[lightboxIndex].src;
    img.alt = C.gallery.images[lightboxIndex].alt;
    caption.textContent = C.gallery.images[lightboxIndex].alt;
  }

  function initLightbox() {
    document.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox__prev').addEventListener('click', () => navLightbox(-1));
    document.querySelector('.lightbox__next').addEventListener('click', () => navLightbox(1));

    document.addEventListener('keydown', e => {
      const lb = document.getElementById('lightbox');
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
  }

  // ── Amenities ───────────────────────────────────────────────
  function initAmenities() {
    const { amenities } = C;
    document.getElementById('amenities-title').textContent = amenities.title;

    const grid = document.getElementById('amenities-grid');
    amenities.categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'amenity-card reveal';
      card.innerHTML = `
        <div class="amenity-card__icon">
          <i data-lucide="${iconName(cat.icon)}"></i>
        </div>
        <h3 class="amenity-card__title">${cat.name}</h3>
        <ul class="amenity-card__list">
          ${cat.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
      grid.appendChild(card);
    });
  }

  // ── Location ────────────────────────────────────────────────
  function initLocation() {
    const { location } = C;
    document.getElementById('location-title').textContent = location.title;
    document.getElementById('location-description').textContent = location.description;
    document.getElementById('location-map').src = location.mapEmbedUrl;

    const list = document.getElementById('location-attractions');
    location.nearbyAttractions.forEach(a => {
      const li = document.createElement('li');
      li.className = 'location__attraction';
      li.innerHTML = `
        <div class="location__attraction-icon">
          <i data-lucide="map-pin"></i>
        </div>
        <div>
          <div class="location__attraction-name">${a.name}</div>
          <div class="location__attraction-distance">${a.distance}</div>
        </div>
      `;
      list.appendChild(li);
    });
  }

  // ── Reviews ─────────────────────────────────────────────────
  function initReviews() {
    const { reviews } = C;
    document.getElementById('reviews-title').textContent = reviews.title;

    // Overall rating
    const ratingEl = document.getElementById('reviews-rating');
    const starsHtml = Array.from({ length: 5 }, (_, i) =>
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${i < Math.round(reviews.averageRating) ? '#F5A623' : '#E0E0E0'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`
    ).join('');

    ratingEl.innerHTML = `
      <div class="reviews__stars">${starsHtml}</div>
      <div class="reviews__average">${reviews.averageRating}</div>
      <div class="reviews__average-label">out of 5 · ${reviews.items.length} reviews</div>
    `;

    // Review cards
    const grid = document.getElementById('reviews-grid');
    reviews.items.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card reveal';
      const stars = Array.from({ length: 5 }, (_, i) =>
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${i < r.rating ? '#F5A623' : '#E0E0E0'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`
      ).join('');

      const initials = r.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

      card.innerHTML = `
        <div class="review-card__stars">${stars}</div>
        <p class="review-card__text">${r.text}</p>
        <div class="review-card__author">
          <div class="review-card__avatar">${initials}</div>
          <div>
            <div class="review-card__name">${r.name}</div>
            <div class="review-card__date">${r.date}</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ── Contact ─────────────────────────────────────────────────
  function initContact() {
    const { contact } = C;
    document.getElementById('contact-title').textContent = contact.title;
    document.getElementById('contact-description').textContent = contact.description;

    const details = document.getElementById('contact-details');
    const items = [
      { icon: 'mail', label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
      { icon: 'phone', label: 'Phone', value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, '')}` },
    ];

    if (contact.airbnbLink) {
      items.push({ icon: 'link', label: 'Airbnb', value: 'View listing →', href: contact.airbnbLink });
    }

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'contact__detail';
      div.innerHTML = `
        <div class="contact__detail-icon">
          <i data-lucide="${iconName(item.icon)}"></i>
        </div>
        <div>
          <div class="contact__detail-label">${item.label}</div>
          <div class="contact__detail-value">
            <a href="${item.href}" ${item.icon === 'link' ? 'target="_blank" rel="noopener"' : ''}>${item.value}</a>
          </div>
        </div>
      `;
      details.appendChild(div);
    });

    // Contact form
    const formWrap = document.getElementById('contact-form-wrap');
    if (contact.formEnabled) {
      formWrap.innerHTML = `
        <h3 class="contact__form-title">Send a Message</h3>
        <form action="${contact.formAction}" method="POST">
          <div class="form__group">
            <label class="form__label" for="form-name">Your Name</label>
            <input class="form__input" type="text" id="form-name" name="name" required />
          </div>
          <div class="form__group">
            <label class="form__label" for="form-email">Email Address</label>
            <input class="form__input" type="email" id="form-email" name="email" required />
          </div>
          <div class="form__group">
            <label class="form__label" for="form-message">Message</label>
            <textarea class="form__textarea" id="form-message" name="message" required></textarea>
          </div>
          <button type="submit" class="btn btn--primary form__submit">Send Message</button>
        </form>
      `;
    } else {
      formWrap.remove();
    }
  }

  // ── Footer ──────────────────────────────────────────────────
  function initFooter() {
    const { footer } = C;
    document.getElementById('footer-copyright').textContent = footer.copyright;

    const socials = document.getElementById('footer-socials');
    if (footer.socialLinks) {
      footer.socialLinks.forEach(s => {
        const a = document.createElement('a');
        a.className = 'footer__social-link';
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', s.platform);
        a.innerHTML = `<i data-lucide="${iconName(s.platform)}"></i>`;
        socials.appendChild(a);
      });
    }
  }

  // ── Scroll Reveal ───────────────────────────────────────────
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ── Initialize Everything ───────────────────────────────────
  initBanner();
  initNav();
  initHero();
  initAbout();
  initGallery();
  initLightbox();
  initAmenities();
  initLocation();
  initReviews();
  initContact();
  initFooter();

  // Initialize Lucide icons after dynamic content is rendered
  lucide.createIcons();

  // Initialize reveal animations after all content is in the DOM
  initReveal();
});
