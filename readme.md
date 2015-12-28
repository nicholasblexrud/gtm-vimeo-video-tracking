# Vimeo tracking in Google Tag Manager
This script is derived from [Tracking Video with Google Analytics Part 2 of 3: Vimeo Edition](http://eroi.com/ideas/tracking-video-with-google-analytics-part-2-of-3-vimeo-edition/) and [Sander Heilbron](https://www.sanderheilbron.nl/) script.

What this script will give you in your Google Analytics Reports:

  * Video Starts
  * Video Pauses (will only send once)
  * Video Resumes (will only send once)
  * Video Seeks (will only send once)
  * Video Progress: 25%, 50%, 75%
  * Video Completions


## Enabling tracking for Vimeo videos
To enabled us to listen to Vimeo’s API messages, we must add a parameter to all Vimeo `iframe src` values: `?api=1` or `&api=1`, depending on if there are additonal parameters.

For example, the video's `iframe` currently looks like this:
```html
<iframe src="https://player.vimeo.com/video/12345678?color=ffffff&byline=0&portrait=0" width="656" height="369" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
```

The new `iframe` code would look like this:
```html
<iframe src="https://player.vimeo.com/video/12345678?color=ffffff&byline=0&portrait=0&api=1" width="656" height="369" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
```

Notes:
- Must be applied to ALL Vimeo videos.
- Additional documentation on Vimeo's API here: [Player JavaScript API](https://developer.vimeo.com/player/js-api)


## Google Tag Manager configuration


 * **Create variables**: 
    * Custom Event: `trackVimeo`
    * Custom JavaScript: `Does Page Contain Vimeo` (add code from `doesPageContainVimeo.js`)
    * Data Layer Variables: `eventCategory`, `eventAction`, `eventLabel`, `eventValue`, and `eventNonInteraction`.


 * **Create triggers **:
  * `trackVimeo`: 
    * Select `Custom Event`
    * Type in `trackVimeo` into *Event name* field.
  * `Page Contains Vimeo`:
    * Select `Page View`
    * Trigger type: `Page View`
    * Select `Some Page Views`
    * `Is Vimeo on Page` equals `true`

 * **Create Tags**: 

    * `Custom HTML Tag`:
      * add `customHTML.js` (you'll need to wrap the script in `<script>` tags.)
      * Select `Some Pages` and `Page Contains Vimeo` trigger

    * `Custom Universal Analytics Tag`:
      * Enter in `Tracking ID`
      * Select `Event` under Track Type
      * Add `Data Layer Variables` to event fields e.g. `{{eventCategory}}` in the Event Category field, etc.
      * Select `More` under Fire On selection, and select `trackVimeo` Custom Event.

## Caveats/TODOs:
  * At this moment, the script only handles one video per page. I looked into providing coverage for multiple videos, but couldn't find an effective/simple way to handle multiple `postMessages`.
  * [According to Vimeo developers](https://github.com/vimeo/player-api/issues/82), there is talk of a new verions of the Froogaloop library getting released early 2016. I'm not sure if they are changing the  Vimeo JavaScript API all together or just the Froogaloop library, so I likely won't be doing any further development on this until after they release new lib.