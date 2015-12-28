function () {
    var searchVideo = "vimeo.com/video";
    var iframes = document.getElementsByTagName('iframe');
    var i;

    for (i = 0; i < iframes.length; i++) {
        if (iframes[i].getAttribute("src").indexOf(searchVideo) > -1) {
            return true;
        }
    }
    return false;
}