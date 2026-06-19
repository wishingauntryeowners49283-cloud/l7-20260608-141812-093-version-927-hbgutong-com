(function() {
  function initMoviePlayer(settings) {
    var video = document.getElementById(settings.videoId);
    var cover = document.getElementById(settings.coverId);
    var attached = false;
    var hls = null;

    if (!video || !settings.source) {
      return;
    }

    function attachMedia() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = settings.source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(settings.source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        return;
      }

      video.src = settings.source;
    }

    function start() {
      attachMedia();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
