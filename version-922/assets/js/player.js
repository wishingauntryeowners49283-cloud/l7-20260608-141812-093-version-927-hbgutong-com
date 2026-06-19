import { H as Hls } from './hls-vendor-dru42stk.js';

function startPlayer(shell) {
  const video = shell.querySelector('video');
  const src = shell.dataset.src;

  if (!video || !src) {
    return;
  }

  shell.classList.add('playing');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (!video.src) {
      video.src = src;
    }
    video.play().catch(function () {});
    return;
  }

  if (Hls && Hls.isSupported()) {
    if (!shell.hlsInstance) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      shell.hlsInstance = hls;
    } else {
      video.play().catch(function () {});
    }
  }
}

document.querySelectorAll('.js-player').forEach(function (shell) {
  const button = shell.querySelector('.play-overlay');

  if (button) {
    button.addEventListener('click', function () {
      startPlayer(shell);
    });
  }
});
