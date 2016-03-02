(function ($, window, dL) {
    'use strict';

    var $window = $(window);

    var vimeoGAJS = {
        iframes: [],
        eventMarker: {},

        getIframeSrc: function (iframe) {
            return iframe.attr('src').split('?')[0];
        },

        getIframeId: function (iframe) {
            return iframe.attr('id');
        },

        removeUndefinedIframes: function (iframe) {
            var iframeId = $(iframe).attr('id');
            var iframeSrc = $(iframe).attr('src');

            // remove if iframes src doesn't contain player_id as we won't be able to trigger events from it
            if (iframeSrc.indexOf('player_id') === -1) {
                return false;
            }

            // As this function is called more than once do not remove the eventMarkers
            if (this.eventMarker[iframeId]) {
                return true;
            }

            this.eventMarker[iframeId] = {
                progress25: false,
                progress50: false,
                progress75: false,
                videoPlayed: false,
                videoPaused: false,
                videoResumed: false,
                videoSeeking: false,
                videoCompleted: false,
                timePercentComplete: 0
            };

            return true;
        },

        initIframes: function () {
            var $vimeoIframes = $('iframe[src*="player.vimeo.com/video"]');

            this.iframes = $.grep($vimeoIframes, $.proxy(this.removeUndefinedIframes, this));
        },

        // Handle messages received from the player
        onMessageReceived: function (e) {

            if (!(/^https?:\/\/player\.vimeo\.com/).test(e.originalEvent.origin)) {
                return;
            }

            var data = JSON.parse(e.originalEvent.data);
            var $iframe = $("#" + data.player_id);

            switch (data.event) {
            case 'ready':
                this.initIframes();
                this.onReady();
                break;

            case 'playProgress':
                this.onPlayProgress(data.data, $iframe);
                break;

            case 'seek':
                this.onSeek($iframe);
                break;

            case 'play':
                this.onPlay($iframe);
                break;

            case 'pause':
                this.onPause($iframe);
                break;

            case 'finish':
                this.onFinish($iframe);
                break;
            }
        },

        // Helper function for sending a message to the player
        post: function (method, params, iframe) {
            var data = JSON.stringify({
                method: method,
                value: params
            });

            var iframeSrc = $(iframe).attr('src').split('?')[0];

            iframe.contentWindow.postMessage(data, iframeSrc);

        },

        handleOnReady: function (index, iframe) {
            this.post('addEventListener', 'play', iframe);
            this.post('addEventListener', 'seek', iframe);
            this.post('addEventListener', 'pause', iframe);
            this.post('addEventListener', 'finish', iframe);
            this.post('addEventListener', 'playProgress', iframe);
        },

        onReady: function () {
            $.each(this.iframes, $.proxy(this.handleOnReady, this));

        },

        onFinish: function (iframe) {
            var iframeId = this.getIframeId(iframe);
            if (!this.eventMarker[iframeId].videoCompleted) {
                this.sendEvent(iframe, 'Completed video');
                this.eventMarker[iframeId].videoCompleted = true; // Avoid subsequent finish trackings
            }
        },

        onSeek: function (iframe) {
            var iframeId = this.getIframeId(iframe);
            if (!this.eventMarker[iframeId].videoSeeking) {
                this.sendEvent(iframe, 'Skipped video forward or backward');
                this.eventMarker[iframeId].videoSeeking = true; // Avoid subsequent seek trackings
            }
        },

        onPlay: function (iframe) {
            var iframeId = this.getIframeId(iframe);

            if (!this.eventMarker[iframeId].videoPlayed) {
                this.sendEvent(iframe, 'Started video');
                this.eventMarker[iframeId].videoPlayed = true; // Avoid subsequent play trackings
            }

            if (!this.eventMarker[iframeId].videoResumed && this.eventMarker[iframeId].videoPaused) {
                this.sendEvent(iframe, 'Resumed video');
                this.eventMarker[iframeId].videoResumed = true; // Avoid subsequent resume trackings
            }
        },

        onPause: function (iframe) {
            var iframeId = this.getIframeId(iframe);
            if (this.eventMarker[iframeId].timePercentComplete < 99 && !this.eventMarker[iframeId].videoPaused) {
                this.sendEvent(iframe, 'Paused video');
                this.eventMarker[iframeId].videoPaused = true; // Avoid subsequent pause trackings
            }

        },

        // Tracking video progress
        onPlayProgress: function (data, iframe) {
            var iframeId = this.getIframeId(iframe);
            var progress;

            this.eventMarker[iframeId].timePercentComplete = Math.round((data.percent) * 100);

            if (this.eventMarker[iframeId].timePercentComplete > 24 && !this.eventMarker[iframeId].progress25) {
                progress = 'Played video: 25%';
                this.eventMarker[iframeId].progress25 = true;
            }

            if (this.eventMarker[iframeId].timePercentComplete > 49 && !this.eventMarker[iframeId].progress50) {
                progress = 'Played video: 50%';
                this.eventMarker[iframeId].progress50 = true;
            }

            if (this.eventMarker[iframeId].timePercentComplete > 74 && !this.eventMarker[iframeId].progress75) {
                progress = 'Played video: 75%';
                this.eventMarker[iframeId].progress75 = true;
            }

            if (progress) {
                this.sendEvent(iframe, progress);
            }
        },

        sendEvent: function (iframe, action) {
            var iframeSrc = this.getIframeSrc(iframe);

            dL.push({
                event: 'trackEvent',
                eventCategory: 'Vimeo',
                eventAction: action,
                eventLabel: iframeSrc,
                eventValue: undefined,
                eventNonInteraction: false
            });
        }
    };

    $window.on('message', $.proxy(vimeoGAJS.onMessageReceived, vimeoGAJS));

}(jQuery, window, dataLayer));