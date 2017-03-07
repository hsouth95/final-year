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

            }
        },
        {
            name: "history",
            loaded: false,
            url: location.origin + "/view/history",
            onload: function () {

            }
        },
        {
            name: "medication",
            loaded: false,
            url: location.origin + "/view/medication",
            onload: function () {
                populateDrugs();
            }
        }
    ],
        EPISODE_ID = null;

    findPatient = function () {
        var patientNumber = $("#patient_number").val();

        getPatient(patientNumber).done(fillPatientModal);
    }

    fillPatientModal = function (data) {
        var episodeId = null;
        $("#modal-info").append("<div class='card-panel teal'>" +
            "<h4>" + data.surname + ", " + data.firstname + "</h4>" +
            "</div>");

        $.getJSON(location.origin + "/patient/" + data.patient_id + "/latestepisodeid").done(function (data) {
            if (data && data.length > 0) {
                episodeId = data.episode_id;
                $("#modal-info .card-panel").append("<span>An Episode is in progress</span>");
            }
        });

        $("#find-patient-modal").modal("open");
    }

    selectPatient = function(){
        
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
                        tab.onload();
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