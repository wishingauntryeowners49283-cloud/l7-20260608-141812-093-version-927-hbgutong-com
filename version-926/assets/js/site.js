document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobileMenu.hasAttribute('hidden');
      if (isHidden) {
        mobileMenu.removeAttribute('hidden');
        document.body.classList.add('locked');
      } else {
        mobileMenu.setAttribute('hidden', '');
        document.body.classList.remove('locked');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    var startTimer = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var empty = panel.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var cardText = function (card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    };

    var filterCards = function () {
      var keyword = normalize(input && input.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var cardRegion = normalize(card.getAttribute('data-region') + ' ' + card.textContent);
        var cardType = normalize(card.getAttribute('data-type'));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || cardRegion.indexOf(region) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1 || text.indexOf(type) !== -1;
        var matched = matchKeyword && matchRegion && matchType;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });
});
