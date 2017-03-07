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
        }
    ],
        EPISODE_ID = null,
        selectedPatient = null;

    findPatient = function () {
        var patientNumber = $("#patient_number").val();

        getPatient(patientNumber).done(fillPatientModal);
    }

    fillPatientModal = function (data) {
        var episodeId = null;

        $.getJSON(location.origin + "/patient/" + data.patient_id + "/latestepisodeid").done(function (results) {
            debugger;
            var panel = document.createElement("div");
            panel.className = "patient-card card-panel blue lighten-4";
            panel.dataset.patientId = data.patient_id;

            panel.addEventListener("click", selectPatient);

            var nameElement = document.createElement("h4");
            nameElement.innerHTML = data.surname + ", " + data.firstname;

            panel.appendChild(nameElement);

            if (results && results.length > 0) {
                episodeId = results.episode_id;
                panel.dataset.episodeId = results.episode_id;
            }

            document.getElementById("modal-info").appendChild(panel);
        });


        populatePatient(data);

        $("#find-patient-modal").modal("open");
    }

    selectPatient = function () {
        selectedPatient = this.dataset.patient_id;
        selectedEpisode = this.dataset.episode_id;

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
            url: location.origin + "/hospital",
            success: function (data) {
                $("input#hospital_number").autocomplete({
                    data: convertJSONArrayToAutocomplete(data, "name")
                });
            }
        });
    };

    populateDrugs = function () {
        $.getJSON(location.origin + "/medication").done(function (data) {
            var apples = convertJSONArrayToAutocomplete(data, "name");
            $("input#drug-name").autocomplete({
                data: apples
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
        return $.getJSON(location.origin + "/patient/" + patientId);
    }

    $('select').material_select();

    $(".tab a").click(changeTab);
});