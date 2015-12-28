
(function ($, window, dL) {
    "use strict";

    var $window = $(window);

    var vimeoTracking = {

        init: function () {
            this.player = $('iframe[src*="player.vimeo.com/video"]').eq(0);
            this.playerSrc = this.player.attr('src').split('?')[0];
            this.progress25 = false;
            this.progress50 = false;
            this.progress75 = false;
            this.videoPlayed = false;
            this.videoPaused = false;
            this.videoResumed = false;
            this.videoSeeking = false;
            this.videoCompleted = false;
            this.timePercentComplete = 0;
        },

        onMessageReceived: function (e) {

            if (!(/^https?:\/\/player\.vimeo\.com/).test(e.originalEvent.origin)) {
                return;
            }

            var data = JSON.parse(e.originalEvent.data);

            switch (data.event) {
            case 'ready':
                this.onReady();
                break;

            case 'playProgress':
                this.onPlayProgress(data.data);
                break;

            case 'seek':
                this.onSeek();
                break;

            case 'play':
                this.onPlay();
                break;

            case 'pause':
                this.onPause();
                break;

            case 'finish':
                this.onFinish();
                break;
            }
        },

        onReady: function () {
            this.init();

            this.post('addEventListener', 'play');
            this.post('addEventListener', 'seek');
            this.post('addEventListener', 'pause');
            this.post('addEventListener', 'finish');
            this.post('addEventListener', 'playProgress');
        },

        onPlayProgress: function (data) {
            this.timePercentComplete = Math.round((data.percent) * 100);

            var progress;

            if (this.timePercentComplete > 24 && !this.progress25) {
                progress = 'Played video: 25%';
                this.progress25 = true;
            }

            if (this.timePercentComplete > 49 && !this.progress50) {
                progress = 'Played video: 50%';
                this.progress50 = true;
            }

            if (this.timePercentComplete > 74 && !this.progress75) {
                progress = 'Played video: 75%';
                this.progress75 = true;
            }

            if (progress) {
                this.sendEvent(progress);
            }
        },

        onSeek: function () {
            if (!this.videoSeeking) {
                this.sendEvent('Skipped video forward or backward');
                this.videoSeeking = true;
            }
        },

        onPlay: function () {
            if (!this.videoPlayed) {
                this.sendEvent('Started video');
                this.videoPlayed = true;
            }

            if (!this.videoResumed && this.videoPaused) {
                this.sendEvent('Resumed video');
                this.videoResumed = true;
            }
        },

        onPause: function () {
            if (this.timePercentComplete < 99 && !this.videoPaused) {
                this.sendEvent('Paused video');
                this.videoPaused = true;
            }
        },

        onFinish: function () {
            if (!this.videoCompleted) {
                this.sendEvent('Completed video');
                this.videoCompleted = true;
            }
        },

        sendEvent: function (action) {
            dL.push({
                'event': 'trackVimeo',
                'eventCategory': 'Vimeo',
                'eventAction': action,
                'eventLabel': this.playerSrc,
                'eventValue': undefined,
                'eventNonInteraction': true
            });
        },

        post: function (method, params) {
            var data = JSON.stringify({
                method: method,
                value: params
            });

            this.player[0].contentWindow.postMessage(data, this.playerSrc);

        }
    };

    $window.on('message', $.proxy(vimeoTracking.onMessageReceived, vimeoTracking));

}(jQuery, window, dataLayer));