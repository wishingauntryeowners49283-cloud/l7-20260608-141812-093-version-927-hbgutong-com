(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    var filterGrid = document.querySelector('[data-filter-grid]');

    if (filterGrid) {
        var filterInput = document.querySelector('[data-filter-input]');
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
        var activeFilter = '';

        function applyFilter() {
            var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden-by-filter', !(matchQuery && matchFilter));
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-button') || '';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    }

    var searchResults = document.querySelector('[data-search-results]');

    if (searchResults && window.MOVIE_SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var searchInput = document.querySelector('[data-search-page-input]');
        var summary = document.querySelector('[data-search-summary]');
        var hotwords = Array.prototype.slice.call(document.querySelectorAll('[data-search-hotword]'));

        if (searchInput) {
            searchInput.value = queryValue;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderSearch(keyword) {
            var word = String(keyword || '').trim().toLowerCase();
            var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                if (!word) {
                    return true;
                }
                return movie.searchText.toLowerCase().indexOf(word) !== -1;
            }).slice(0, 80);

            if (summary) {
                summary.textContent = word ? '为你找到相关影片' : '热门影片推荐';
            }

            if (!list.length) {
                searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片，可以尝试更换关键词。</div>';
                return;
            }

            searchResults.innerHTML = list.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">' +
                    '<span class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="badge badge-primary">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="badge badge-dark">' + escapeHtml(movie.year) + '</span>' +
                    '</span>' +
                    '<span class="movie-card-body">' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<span>' + escapeHtml(movie.oneLine) + '</span>' +
                    '<em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</em>' +
                    '</span>' +
                    '</a>' +
                    '</article>';
            }).join('');
        }

        hotwords.forEach(function (button) {
            button.addEventListener('click', function () {
                var word = button.getAttribute('data-search-hotword') || '';
                if (searchInput) {
                    searchInput.value = word;
                }
                renderSearch(word);
            });
        });

        renderSearch(queryValue);
    }
})();
