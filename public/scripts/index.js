$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    var TABS = [
        {
            name: "patient",
            url: location.origin + "/view/patient",
            loaded: true,
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 200
                });
                populateHospitals();

                $("#find-patient").click(findPatient);


                $(".modal").modal();
            }
        },
        {
            name: "observations",
            url: location.origin + "/view/observations",
            loaded: false,
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 200
                });
                $("select").material_select();
                $("#start-episode").click(startEpisode);
            }
        },
        {
            name: "history",
            loaded: false,
            url: location.origin + "/view/history",
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 200
                });
                $("select").material_select();
            }
        },
        {
            name: "medication",
            loaded: false,
            url: location.origin + "/view/medication",
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 200
                });
                $("select").material_select();
                populateDrugs();
            }
        },
        {
            name: "treatment",
            loaded: false,
            url: location.origin + "/view/treatment",
            onload: function () {
                $("select").material_select();

                populateDrugs();
            }
        },
        {
            name: "results",
            loaded: false,
            url: location.origin + "/view/results",
            onload: function () {
                $("select").material_select();
            }
        },
        {
            name: "diagnosis",
            loaded: false,
            url: location.origin + "/view/diagnosis",
            onload: function () {
                // populate diagnosis list
                populateDiagnosis();
            }
        }
    ],
        episode = {},
        selectedPatient = null;

    findPatient = function () {
        var patientNumber = $("#patient_number").val();

        getPatient(patientNumber).done(fillPatientModal);
    }

    fillPatientModal = function (data) {
        $.getJSON(location.origin + "/models/patients/" + data.patient_id).done(function (results) {
            var panel = document.createElement("div");
            panel.className = "patient-card card-panel blue lighten-4";
            panel.dataset.patientId = data.patient_id;

            panel.addEventListener("click", selectPatient);

            var nameElement = document.createElement("h4");
            nameElement.innerHTML = data.surname + ", " + data.firstname;

            panel.appendChild(nameElement);

            document.getElementById("modal-info").appendChild(panel);
        });


        populatePatient(data);

        $("#find-patient-modal").modal("open");
    }

    selectPatient = function () {
        episode.patient_id = this.dataset.patient_id;

        this.className = "patient-card card-panel blue lighten-1";
    }

    acceptPatient = function () {

    }

    changeTab = function () {
        var tab = null,
            tabClicked = this;

        for (var i = 0; i < TABS.length; i++) {
            if (tabClicked.dataset.html === TABS[i].name) {
                tab = TABS[i];
                tab.index = i;
                break;
            }
        }

        if (tab) {
            $("#form-container form").hide();
            $("#" + tabClicked.dataset.formId).show();
            if (!tab.loaded) {
                getFormHtml(tab.url).done(function (data) {
                    $("#" + tabClicked.dataset.formId).append(data);
                    if (tab.onload) {
                        setTimeout(tab.onload, 100);
                        TABS[tab.index].loaded = true;
                    }
                });
            }
        } else {
            console.error("Tab is not set.");
        }
    }


    getFormHtml = function (url) {
        return $.get(url);
    };

    getFormHtml(TABS[0].url).done(function (data) {
        $("#patient-form").append(data);
        TABS[0].onload();
    });

    populatePatient = function (data) {
        for (var attribute in data) {
            if (data.hasOwnProperty(attribute)) {
                if (attribute === "address") {
                    for (var addressAttribute in data.address) {
                        if (data.address.hasOwnProperty(addressAttribute)) {
                            $("#" + addressAttribute).val(data.address[addressAttribute]);
                        }
                    }
                } else {
                    $("#patient_" + attribute).val(data[attribute]);
                }
            }
        }
        Materialize.updateTextFields();
    }

    populateHospitals = function () {
        $.ajax({
            type: "GET",
            url: location.origin + "/models/hospitals",
            success: function (data) {
                $("input#hospital_number").autocomplete({
                    data: convertJSONArrayToAutocomplete(data, "name")
                });
            }
        });
    };

    populateDrugs = function () {
        $.getJSON(location.origin + "/models/medication").done(function (data) {
            var drugData = convertJSONArrayToAutocomplete(data, "name");
            $("input#drug-name").autocomplete({
                data: drugData
            });
        });
    };

    populateDiagnosis = function () {
        $.getJSON(location.origin + "/models/diagnosis").done(function (data) {
            var diagnosisData = convertJSONArrayToAutocomplete(data, "name");
            $("input#problemlist").autocomplete({
                data: diagnosisData,
                multiple: {
                    enable: true
                }
            });
        });
    }

    convertJSONArrayToAutocomplete = function (data, attributeToConvert) {
        var convertedData = {};

        for (var i = 0; i < data.length; i++) {
            if (data[i].hasOwnProperty(attributeToConvert)) {
                // Materialize looks at attribute name, therefore convert array into one object
                convertedData[data[i][attributeToConvert]] = null;
            }
        }

        return convertedData;
    }

    getPatient = function (patientId) {
        return $.getJSON(location.origin + "/models/patient/" + patientId);
    }

    startEpisode = function () {
        var source = $("#observations_source_referral").val(),
            reason = $("#observations_referral_reason").val();

        episode.source_referral = source;
        episode.reason_referral = reason;
        episode.date = moment().format("YYYY-MM-DD");

        $.post(
            location.origin + "/models/patient/" + episode.patient_id + "/episode",
            episode,
            function () {
                
            });
    }


    $('select').material_select();

    $(".tab a").click(changeTab);
});