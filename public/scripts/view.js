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

        populateEntityFields("clinical_episode", episode);
        //$("#date").html(episode.date.substring(0, 10));

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
                populatePastMedicalHistory(data[0]);
            }
        });

        $.getJSON(episodeBaseURL + "/observations", function (data) {
            episode.observations = data;

            populateObservations(data);

            //$("body").append(JSON.stringify(data[0]));
            $.post(location.origin + "/abnormal?entity=observations", data[0], function (data) {
                //$("#abnormal-results").html(JSON.stringify(data));
            });
        });

        $.getJSON(episodeBaseURL + "/bloodresults", function (data) {
            if (data && data.length === 1) {

                episode.bloodresults = data[0];
                populateAbnormalBloodResults(data[0]);
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

    populateObservations = function (observations) {
        if (observations && observations.length >= 1) {
            $.each(observations, function () {
                getObservationElements(this, function (filteredObservation) {
                    addTableRow("observations", filteredObservation);
                });
            });
        }
    }

    getObservationElements = function (observation, success) {
        // Retrieve the abnormal results for this observations, must be done asynchronously
        getAbnormalResults("observations", observation).done(function (abnormalResults) {
            var fields = [
                "date",
                "time",
                "bp_systolic",
                "bp_diastolic",
                "pulse",
                "temperature",
                "respiratory_rate",
                "avpu",
                "news_score"
            ],
                filteredObservation = [];

            for (var attribute in fields) {
                var fieldName = fields[attribute],
                    element = document.createElement("div");

                if (observation.hasOwnProperty(fieldName)) {
                    var abnormalResult = getAbnormalResultFromValue(abnormalResults, fieldName);

                    if (abnormalResult) {
                        element.className = abnormalResult.isHigh ? "high-result" : "low-result";
                    }

                    element.innerHTML = observation[fieldName];

                } else {
                    element.innerHTML = "-";
                }

                filteredObservation.push(element);
            }

            success(filteredObservation);
        });
    }

    getPastMedicalHistory = function (history) {
        var pastMedicalHistoryFields = {
            ihd: "IHD",
            dm: "DM",
            epilepsy: "Epilepsy",
            asthma: "Asthma",
            copd: "COPD",
            mi: "MI",
            dvt: "DVT",
            pe: "PE",
            tia: "TIA",
            cva: "CVA"
        },
            presentPastHistory = [];

        for (var fieldName in pastMedicalHistoryFields) {
            if (history.hasOwnProperty(fieldName) && history[fieldName] === 1) {
                presentPastHistory.push(pastMedicalHistoryFields[fieldName]);
            }
        }

        return presentPastHistory;
    }

    populatePastMedicalHistory = function (history) {
        var container = document.getElementById("past_medical_history"),
            pastMedicalHistoryFields = getPastMedicalHistory(history);

        $.each(pastMedicalHistoryFields, function () {
            var element = document.createElement("div"),
                tickIcon = document.createElement("i");

            element.className = "chip pmh-chip";
            element.innerHTML = this;
            tickIcon.className = "material-icons";
            tickIcon.innerHTML = "done";

            element.appendChild(tickIcon);

            container.appendChild(element);
        });
    }

    populateAbnormalBloodResults = function (results) {
        getAbnormalResults("blood_results", results).done(function (abnormalResults) {
            var container = document.getElementById("abnormal-results");

            $.each(abnormalResults, function () {
                if (results.hasOwnProperty(this.name)) {
                    var element = document.createElement("div");

                    if (this.isHigh) {
                        element.className = "chip red lighten-3";
                    } else {
                        element.className = "chip cyan lighten-3";
                    }

                    element.innerHTML = toTitleCase(this.name) + ": " + results[this.name];

                    container.appendChild(element);
                }
            });
        });
    }

    getAbnormalResults = function (entityName, data) {
        return results = $.ajax({
            url: location.origin + "/abnormal?entity=" + entityName,
            type: "POST",
            data: data
        });
    }

    getAbnormalResultFromValue = function (abnormalResults, attributeName) {
        for (var attribute in abnormalResults) {
            var fieldName = abnormalResults[attribute].name;
            if (fieldName === attributeName) {
                return abnormalResults[attribute];
            }
        }

        return null;
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

    function getFriendlyName(originalName, isAbbreviation) {
        if (isAbbreviation) {
            return originalName.replace("_", " ").toUpperCase();
        } else {
            return toTitleCase(originalName.replace("_", " "));
        }
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    function addTableRow(elementId, elements) {
        var rowElement = document.createElement("tr");

        $.each(elements, function () {
            var tableCell = document.createElement("td");
            tableCell.appendChild(this);

            rowElement.appendChild(tableCell);
        });

        $("#" + elementId + " > tbody:last-child").append(rowElement);
    }

    $('ul.tabs').tabs();
});