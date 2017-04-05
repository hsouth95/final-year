$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    var episodeId = /[^/]*$/.exec(location.href)[0],
        episode = {};
    
    
});