(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMenu() {
        var button = $('[data-menu-button]');
        var nav = $('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        $all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';

                if (!query) {
                    event.preventDefault();
                }
            });
        });
    }

    function setupHeroSlider() {
        var slider = $('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = $all('[data-hero-slide]', slider);
        var dots = $all('[data-hero-dot]', slider);
        var prev = $('[data-hero-prev]', slider);
        var next = $('[data-hero-next]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCategoryFilters() {
        var bar = $('[data-filter-bar]');
        var grid = $('[data-card-grid]');

        if (!bar || !grid) {
            return;
        }

        var input = $('[data-filter-input]', bar);
        var yearSelect = $('[data-year-filter]', bar);
        var clear = $('[data-clear-filter]', bar);
        var count = $('[data-filter-count]');
        var cards = $all('[data-movie-card]', grid);

        function apply() {
            var keyword = normalize(input && input.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var shouldShow = matchedKeyword && matchedYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '显示 ' + visible + ' 部影片';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }

                if (yearSelect) {
                    yearSelect.value = '';
                }

                apply();
            });
        }
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="movie-cover" href="' + escapeAttribute(movie.url) + '">',
            '        <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\'); this.removeAttribute(\'src\');">',
            '        <span class="duration-badge">高清</span>',
            '        <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '        <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function setupSearchPage() {
        var results = $('#search-results');

        if (!results || !window.MOVIE_INDEX) {
            return;
        }

        var input = $('#search-input');
        var category = $('#category-select');
        var year = $('#year-input');
        var button = $('#search-button');
        var count = $('#search-count');
        var params = new URLSearchParams(window.location.search);

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function render() {
            var keyword = normalize(input && input.value);
            var selectedCategory = normalize(category && category.value);
            var selectedYear = normalize(year && year.value);
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));

                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okCategory = !selectedCategory || normalize(movie.category) === selectedCategory;
                var okYear = !selectedYear || normalize(movie.year) === selectedYear;

                return okKeyword && okCategory && okYear;
            }).slice(0, 240);

            results.innerHTML = matched.map(movieCard).join('\n');

            if (count) {
                count.textContent = '显示 ' + matched.length + ' 部影片' + (matched.length === 240 ? '（已限制展示前 240 条，可继续输入关键词缩小范围）' : '');
            }
        }

        if (button) {
            button.addEventListener('click', render);
        }

        [input, category, year].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', render);
            control.addEventListener('change', render);
        });

        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearchForms();
        setupHeroSlider();
        setupCategoryFilters();
        setupSearchPage();
    });
})();
