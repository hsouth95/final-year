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
                $("#find-gp").click(findGP);


                $(".modal").modal();
            },
            completedAttributes: [
                "hospital_id",
                "patient_id",
                "gp_id"
            ]
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
        FormAPI = {},
        episode = {},
        selectedPatient = null;

    findPatient = function () {
        var patientNumber = $("#patient_number").val();

        fillPatientModal(patientNumber);
    }

    findGP = function () {
        var firstName = $("#gp_firstname").val(),
            surname = $("#gp_surname").val(),
            params = {};

        if (firstName) {
            params.firstname = firstName;
        }
        if (surname) {
            params.surname = surname;
        }

        fillGPModal($.param(params));
    }

    fillPatientModal = function (patientNumber) {
        FormAPI.modals.buildSelectionModal({
            dataUrl: location.origin + "/patients/" + patientNumber,
            dataValue: "patient_id",
            header: "firstname",
            subtext: "surname",
            title: "Patients",
            selectedCallback: function (data) {
                FormAPI.data.populate(data, "patient");
                episode.patient = data;
                episode.patient_id = data.patient_id;
                FormAPI.tabs.updateCompletion();
            }
        });

        FormAPI.modals.openSelectionModal();
    }

    fillGPModal = function (query) {
        FormAPI.modals.buildSelectionModal({
            dataUrl: location.origin + "/gp?" + query,
            dataValue: "gp_id",
            header: "firstname",
            subtext: "surname",
            title: "General Practioners",
            selectedCallback: function (data) {
                FormAPI.data.populate(data, "gp");
                episode.gp = data;
                episode.gp_id = data.gp_id;
                FormAPI.tabs.updateCompletion();
            }
        });

        FormAPI.modals.openSelectionModal();
    }

    getFormHtml = function (url) {
        return $.get(url);
    };

    populateHospitals = function () {
        $.ajax({
            type: "GET",
            url: location.origin + "/hospitals",
            success: function (data) {
                $("input#hospital_name").autocomplete({
                    data: convertJSONArrayToAutocomplete(data, "name"),
                    onAutocomplete: function (val) {
                        episode.hospital_id = val;
                        FormAPI.tabs.updateCompletion();
                    }
                });
            }
        });
    };

    populateDrugs = function () {
        $.getJSON(location.origin + "/medication").done(function (data) {
            var drugData = convertJSONArrayToAutocomplete(data, "name");
            $("input#drug-name").autocomplete({
                data: drugData
            });
        });
    };

    populateDiagnosis = function () {
        $.getJSON(location.origin + "/diagnosis").done(function (data) {
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
    
    startEpisode = function () {
        var source = $("#observations_source_referral").val(),
            reason = $("#observations_referral_reason").val();

        episode.source_referral = source;
        episode.reason_referral = reason;
        episode.date = moment().format("YYYY-MM-DD");

        $.post(
            location.origin + "/patient/" + episode.patient_id + "/episode",
            episode,
            function () {

            });
    }

    FormAPI.modals = {};

    FormAPI.modals.buildSelectionModal = function (options) {
        if (!options || !options.dataValue) {
            return;
        }

        if (options.dataUrl) {
            // Get the data
            $.getJSON(options.dataUrl)
                .done(function (data) {
                    // Build the modal structure
                    if (options.header && options.subtext) {
                        if (data.constructor === Array && data.length > 0) {
                            $.each(data, function () {
                                document.getElementsByClassName("modal-main")[0].appendChild(FormAPI.modals.buildSelector(options.header, options.subtext, options.dataValue, this));
                            });
                        } else if (data.constructor !== Array) {
                            document.getElementsByClassName("modal-main")[0].appendChild(FormAPI.modals.buildSelector(options.header, options.subtext, options.dataValue, data));
                        } else {
                            document.getElementsByClassName("modal-main")[0].innerHTML = "No matches can be found.";
                        }
                    }
                    if (options.title) {
                        $(".modal-title").html(options.title);
                    }
                    // Return the selected data
                    if (options.selectedCallback) {
                        $("#modal-select").click(function () {
                            var selectedId = $(".modal-main").data("id");

                            if (selectedId) {
                                var selectedValue = null;
                                if (data.constructor === Array) {
                                    var selectedValues = $.grep(data, function (e) { return e[options.dataValue] == selectedId });
                                    selectedValue = selectedValues.length >= 1 ? selectedValues[0] : null;
                                } else {
                                    selectedValue = data;
                                }

                                if (selectedValue) {
                                    options.selectedCallback(selectedValue);
                                }

                                FormAPI.modals.closeModal();
                            }
                        });
                    }
                });
        }
    }

    FormAPI.modals.openSelectionModal = function () {
        $("#shared-modal").modal("open");
    }

    FormAPI.modals.buildSelector = function (header, subtext, dataValue, data) {
        var container = document.createElement("div");
        container.className = "modal-selector card-panel blue";
        container.dataset.id = data[dataValue];
        container.addEventListener("click", FormAPI.modals.select);

        var headerElement = document.createElement("span");
        headerElement.className = "header";
        headerElement.innerHTML = data[header];

        var subtextElement = document.createElement("span");
        subtextElement.className = "subtext";
        subtextElement.innerHTML = data[subtext];

        container.appendChild(headerElement);
        container.appendChild(subtextElement);

        return container;
    }

    FormAPI.modals.select = function () {
        $(".modal-selector").removeClass().addClass("modal-selector card-panel blue");

        $(".modal-main").data("id", this.dataset.id);
        this.className = "modal-selector card-panel blue lighten-1";
    }

    FormAPI.modals.closeModal = function () {
        $(".modal-main").empty();
        $(".modal-title").empty();

        $("#shared-modal").modal("close");
    }

    FormAPI.data = {};

    FormAPI.data.populate = function (data, entityName) {
        var selectedFields = $.grep($("input"), function (e) {
            return e.dataset.entity === entityName;
        });

        for (var attribute in data) {
            if (data.hasOwnProperty(attribute)) {
                var relatedField = $.grep(selectedFields, function (e) {
                    return e.dataset.field == attribute;
                });

                if (relatedField && relatedField.length >= 1) {
                    $.each(relatedField, function () {
                        if (relatedField.type === "date") {
                            var dataInput = $("#" + relatedField.id).pickadate(),
                                picker = dataInput.packadate("picker");

                            picker.set("select", data[attribute], { format: "yyyy-mm-dd" });
                        } else {
                            this.value = data[attribute];
                        }
                    });
                }
            }
        }

        Materialize.updateTextFields();
    }

    FormAPI.tabs = {};

    FormAPI.tabs.currentTab = "patient";

    FormAPI.tabs.checkComplete = function () {
        var tab = FormAPI.tabs.getCurrentTab();
        if (tab) {
            completedSection = true;
            $.each(tab.completedAttributes, function () {
                if (!episode[this]) {
                    completedSection = false;
                    return false;
                }
            });

            return completedSection;
        }

        return false;
    }

    FormAPI.tabs.updateCompletion = function () {
        if (FormAPI.tabs.checkComplete()) {
            $("#" + FormAPI.tabs.currentTab + "-tab")
                .removeClass("tab-in-progress")
                .addClass("tab-completed");
        } else {
            var valuesSet = false,
                tab = FormAPI.tabs.getCurrentTab();

            $.each(tab.completedAttributes, function () {
                if (episode[this]) {
                    valuesSet = true;
                    return false;
                }
            });

            if (valuesSet) {
                $("#" + FormAPI.tabs.currentTab + "-tab").addClass("tab-in-progress");
            }
        }
    }

    FormAPI.tabs.getCurrentTab = function () {
        var tabs = $.grep(TABS, function (e) {
            return e.name === FormAPI.tabs.currentTab;
        });

        if (tabs && tabs.length === 1) {
            return tabs[0];
        }

        return null;
    }

    FormAPI.tabs.changeTab = function () {
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

    $('select').material_select();

    $(".tab a").click(FormAPI.tabs.changeTab);

    getFormHtml(TABS[0].url).done(function (data) {
        $("#patient-form").append(data);
        TABS[0].onload();
    });
});