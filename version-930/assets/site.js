const Site = {
    initNavigation: function () {
        const button = document.querySelector('.mobile-nav-button');
        const nav = document.querySelector('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            const opened = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    },
    initHero: function () {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        let current = 0;
        const show = function (index) {
            slides[current].classList.remove('is-active');
            if (dots[current]) {
                dots[current].classList.remove('is-active');
            }
            current = index;
            slides[current].classList.add('is-active');
            if (dots[current]) {
                dots[current].classList.add('is-active');
            }
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    },
    initSearch: function () {
        const input = document.getElementById('movieSearchInput');
        const category = document.getElementById('categoryFilter');
        const type = document.getElementById('typeFilter');
        const region = document.getElementById('regionFilter');
        const reset = document.getElementById('resetSearch');
        const results = document.getElementById('searchResults');
        const count = document.getElementById('searchCount');
        if (!input || !results || !count) {
            return;
        }
        const cards = Array.from(results.querySelectorAll('.movie-card'));
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q');
        if (initial) {
            input.value = initial;
        }
        const normalize = function (value) {
            return (value || '').toString().trim().toLowerCase();
        };
        const filter = function () {
            const keyword = normalize(input.value);
            const catValue = normalize(category ? category.value : '');
            const typeValue = normalize(type ? type.value : '');
            const regionValue = normalize(region ? region.value : '');
            let visible = 0;
            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.category,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchedCategory = !catValue || normalize(card.dataset.category) === catValue;
                const matchedType = !typeValue || normalize(card.dataset.type) === typeValue;
                const matchedRegion = !regionValue || normalize(card.dataset.region) === regionValue;
                const matched = matchedKeyword && matchedCategory && matchedType && matchedRegion;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            count.textContent = visible + ' Movies';
            let empty = results.querySelector('.search-empty');
            if (!visible) {
                if (!empty) {
                    empty = document.createElement('div');
                    empty.className = 'search-empty';
                    empty.textContent = '没有找到匹配的影片';
                    results.appendChild(empty);
                }
            } else if (empty) {
                empty.remove();
            }
        };
        [input, category, type, region].forEach(function (el) {
            if (el) {
                el.addEventListener('input', filter);
                el.addEventListener('change', filter);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                input.value = '';
                if (category) {
                    category.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (region) {
                    region.value = '';
                }
                filter();
            });
        }
        filter();
    },
    initPlayer: function (videoId, overlayId, source) {
        const video = document.getElementById(videoId);
        const overlay = document.getElementById(overlayId);
        if (!video || !overlay || !source) {
            return;
        }
        let started = false;
        let hlsInstance = null;
        const play = function () {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        const start = function () {
            overlay.classList.add('is-hidden');
            video.controls = true;
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', play, { once: true });
                    play();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, play);
                } else {
                    video.src = source;
                    video.addEventListener('loadedmetadata', play, { once: true });
                    play();
                }
                return;
            }
            play();
        };
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
                return;
            }
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    Site.initNavigation();
    Site.initHero();
    Site.initSearch();
});
