(function () {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    const keywordInput = scope.querySelector('[data-filter-keyword]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const container = scope.parentElement || document;
    const cards = Array.from(container.querySelectorAll('[data-card]'));

    function applyFilter() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedType = !type || (card.dataset.type || '') === type;
        const matchedYear = !year || (card.dataset.year || '') === year;

        card.style.display = matchedKeyword && matchedType && matchedYear ? '' : 'none';
      });
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
