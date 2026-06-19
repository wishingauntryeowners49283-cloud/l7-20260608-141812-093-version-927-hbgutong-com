(function () {
    var video = document.getElementById('movie-video');
    var playButton = document.querySelector('[data-play-button]');
    var cover = document.querySelector('.player-cover');
    var stream = typeof streamUrl === 'string' ? streamUrl : '';
    var ready = false;
    var hlsInstance = null;

    if (!video || !stream) {
        return;
    }

    function loadVideo() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = stream;
    }

    function startVideo() {
        loadVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startVideo);
    }

    if (cover) {
        cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
