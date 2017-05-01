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

        $("#date").html(episode.date.substring(0, 10));

        $.getJSON(location.origin + "/patients/" + patientId, function (data) {
            if (data && data.length === 1) {
                data = data[0];
                episode.patient = data;

                populateEntityFields("patient", data);
            }
        }).fail(function (err) {
            alert(err);
        });

        $.getJSON(location.origin + "/hospitals/" + episode.hospital_id, function (data) {
            episode.hospital = data[0];
        });

        $.getJSON(location.origin + "/gp/" + episode.gp_id, function (data) {
            episode.gp = data[0];
        });

        $.getJSON(episodeBaseURL + "/history", function (data) {
            if (data && data.length === 1) {

                episode.history = data[0];

                populateEntityFields("history", data[0]);
            }
        });

        $.getJSON(episodeBaseURL + "/observations", function (data) {
            episode.observations = data;
            data[0].bp_diastolic = 65;
            $("body").append(JSON.stringify(data[0]));
            $.post(location.origin + "/abnormal?entity=observations", data[0], function (data) {
                $("#abnormal-results").html(JSON.stringify(data));
            });
        });

        $.getJSON(episodeBaseURL + "/bloodresults", function (data) {
            if (data && data.length === 1) {

                episode.bloodresults = data[0];
            }
        });

        $.getJSON(episodeBaseURL + "/imagingresults", function (data) {
            if (data && data.length === 1) {
                episode.imagingresults = data[0];
            }
        });

        $.getJSON(episodeBaseURL + "/urineresults", function (data) {
            if (data && data.length === 1) {
                episode.urineresults = data[0];
            }
        });

        $.getJSON(episodeBaseURL + "/currentmedication", function (data) {
            if (data && data.length === 1) {
                episode.currentmedication = data;
            }
        });

        $.getJSON(episodeBaseURL + "/examinations", function (data) {
            if (data && data.length === 1) {
                episode.examinations = data[0];
            }
        });

        $.getJSON(episodeBaseURL + "/problemlist", function (data) {
            if (data && data.length === 1) {
                episode.problemlist = data[0];

                populateEntityFields("problem_list", data[0]);
            }
        });

        $.getJSON(location.origin + "/users/" + episode.completed_by, function (data) {
            if (data && data.length === 1) {
                populateEntityFields("users", data[0]);
            }
        });
    });

    populateEntityFields = function (entityName, data) {
        var fields = $("div[data-entity='" + entityName + "']");

        $.each(fields, function () {
            if (data.hasOwnProperty(this.dataset.field)) {
                this.innerHTML = data[this.dataset.field];
            }
        });
    }

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