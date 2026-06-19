(function () {
    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('active', pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('active', pos === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initCategoryFilter() {
        var input = document.querySelector('.category-filter-input');
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var value = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-region') || ''
                ].join(' ').toLowerCase();
                card.style.display = !keyword || value.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    }

    function createCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="movie-cover" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="./' + movie.coverIndex + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="cover-gradient"></span>',
            '<span class="play-hover">▶</span>',
            '<span class="region-badge">' + escapeHtml(movie.region) + '</span>',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="movie-info">',
            '<h2><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h2>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '</div>'
        ].join('');
        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearch() {
        var result = document.getElementById('searchResult');
        var input = document.getElementById('searchInput');
        var typeFilter = document.getElementById('typeFilter');
        var yearFilter = document.getElementById('yearFilter');
        var reset = document.getElementById('resetSearch');
        if (!result || !input || !Array.isArray(window.MOVIES_DATA)) {
            return;
        }

        var years = Array.from(new Set(window.MOVIES_DATA.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort(function (a, b) {
            return Number(b) - Number(a);
        });

        years.forEach(function (year) {
            var option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var data = window.MOVIES_DATA.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' ').toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (type && movie.type !== type) {
                    return false;
                }
                if (year && movie.year !== year) {
                    return false;
                }
                return true;
            }).slice(0, 120);
            result.innerHTML = '';
            data.forEach(function (movie) {
                result.appendChild(createCard(movie));
            });
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
        input.addEventListener('input', render);
        if (typeFilter) {
            typeFilter.addEventListener('change', render);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', render);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                input.value = '';
                if (typeFilter) {
                    typeFilter.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                render();
            });
        }
        render();
    }

    function initPlayer() {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playerOverlay');
        var payload = window.currentVideo;
        if (!video || !overlay || !payload || !payload.url) {
            return;
        }
        var ready = false;
        var hls = null;

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = payload.url;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(payload.url);
                hls.attachMedia(video);
                return;
            }
            video.src = payload.url;
        }

        function play() {
            attach();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initCategoryFilter();
        initSearch();
        initPlayer();
    });
})();
