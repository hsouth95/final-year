$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    var episodeId = getParameterByName("episodeid"),
        patientId = getParameterByName("patientid"),
        episodeBaseURL = location.origin + "/patients/" + patientId + "/episodes/" + episodeId;
    episode = {};

    $.getJSON(episodeBaseURL, function (data) {
        episode = data[0];
        $("#tesla").html(JSON.stringify(episode, null, 2));

        $.getJSON(location.origin + "/patients/" + patientId, function (data) {
            episode.patient = data;
            $("#tesla").html(JSON.stringify(episode, null, 2));
        }).fail(function (err) {
            alert(err);
        });

        $.getJSON(location.origin + "/hospitals/" + episode.hospital_id, function (data) {
            episode.hospital = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(location.origin + "/gp/" + episode.gp_id, function (data) {
            episode.gp = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/history", function (data) {
            episode.history = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/history", function (data) {
            episode.history = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/observations", function (data) {
            episode.observations = data;

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/bloodresults", function (data) {
            episode.bloodresults = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/imagingresults", function (data) {
            episode.imagingresults = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });
        $.getJSON(episodeBaseURL + "/urineresults", function (data) {
            episode.urineresults = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/currentmedication", function (data) {
            episode.currentmedication = data;

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/examinations", function (data) {
            episode.examinations = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

        $.getJSON(episodeBaseURL + "/problemlist", function (data) {
            episode.examinations = data[0];

            $("#tesla").html(JSON.stringify(episode, null, 2));
        });

    });

    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
});