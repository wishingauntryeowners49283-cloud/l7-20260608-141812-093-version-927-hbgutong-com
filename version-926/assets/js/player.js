document.addEventListener('DOMContentLoaded', function () {
  var video = document.querySelector('[data-player="hls"]');
  var button = document.querySelector('[data-play-button]');
  var config = window.moviePlayerConfig || {};
  var url = config.url || '';
  var initialized = false;
  var hls = null;

  var attachVideo = function () {
    if (!video || !url || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  };

  var playVideo = function () {
    if (!video) {
      return;
    }

    attachVideo();

    if (button) {
      button.hidden = true;
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.hidden = false;
        }
      });
    }
  };

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.hidden = true;
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.hidden = false;
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
