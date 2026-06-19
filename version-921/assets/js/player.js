(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    document.addEventListener('DOMContentLoaded', function () {
        var video = $('[data-hls-player]');
        var overlay = $('[data-play-button]');
        var status = $('[data-player-status]');
        var sourceButtons = $all('[data-source]');
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function destroyHls() {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        }

        function loadSource(sourceUrl, shouldPlay) {
            if (!sourceUrl) {
                setStatus('当前影片暂未绑定播放线路。');
                return;
            }

            destroyHls();

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('HLS 播放源已加载，可正常在线播放。');

                    if (shouldPlay) {
                        video.play().catch(function () {
                            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus('当前线路加载异常，请尝试切换其他线路。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                setStatus('浏览器原生支持 HLS，播放源已绑定。');

                if (shouldPlay) {
                    video.play().catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
                    });
                }
            } else {
                video.src = sourceUrl;
                setStatus('当前浏览器需要 HLS 支持库才能获得完整播放体验。');
            }
        }

        sourceButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                sourceButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });

                button.classList.add('is-active');
                video.setAttribute('data-src', button.getAttribute('data-source'));
                loadSource(button.getAttribute('data-source'), true);

                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        });

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('is-hidden');
                loadSource(video.getAttribute('data-src'), true);
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        loadSource(video.getAttribute('data-src'), false);
    });
})();
