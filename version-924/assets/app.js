(function() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var showSlide = function(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle('active', position === index);
      });
    };
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchList = document.querySelector('[data-search-list]');
  if (searchInput && searchList) {
    var cards = Array.prototype.slice.call(searchList.querySelectorAll('.searchable-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-search-filter]'));
    var activeKind = 'all';
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    searchInput.value = queryValue;

    var applyFilter = function() {
      var query = searchInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var kind = card.getAttribute('data-kind') || 'movie';
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedKind = activeKind === 'all' || kind === activeKind;
        var show = matchedText && matchedKind;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        activeKind = chip.getAttribute('data-search-filter') || 'all';
        chips.forEach(function(item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    searchInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
