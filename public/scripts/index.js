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
                $("#add-observations").click(addObservations);
                $("#add-examination").click(addExamination);
            },
            completedAttributes: [
                "episode_id",
                "observations",
                "examination_id"
            ]
        },
        {
            name: "history",
            loaded: false,
            url: location.origin + "/view/history",
            onload: function () {
                $("#add-history").click(addHistory);
                $("select").material_select();

                setupHandwritingButtons();
            },
            completedAttributes: [
                "history_id"
            ]
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
        HOSPITALS = [],
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
                populateEpisodes(data.patient_id);
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

    addObservations = function () {
        var observations = FormAPI.data.getDataFromForm("observations"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/observations";
        $.post(url, observations, function (data) {
            if (!episode.observations) {
                episode.observations = [];
            }

            displayObservations(observations);

            episode.observations.push(data.observation_id);
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=observations]").val("");
        });
    }

    displayObservations = function (observations) {
        var observationsValues = document.createElement("span");
        observationsValues.innerHTML = JSON.stringify(observations);

        document.getElementById("observations-results").appendChild(observationsValues);
    }

    addExamination = function () {
        var examinations = FormAPI.data.getDataFromForm("examination"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/examinations";

        $.post(url, examinations, function (data) {
            episode.examination_id = data.examination_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=examination]").prop("disabled", true);
        });
    }

    addHistory = function () {
        var history = FormAPI.data.getDataFromForm("history"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/history";

        $.post(url, history, function (data) {
            episode.history_id = data.history_id;
            FromAPI.tabs.updateCompletion();
        });
    }

    getFormHtml = function (url) {
        return $.get(url);
    };

    populateHospitals = function () {
        $.ajax({
            type: "GET",
            url: location.origin + "/hospitals",
            success: function (data) {
                HOSPITALS = data;
                $("input#hospital_name").autocomplete({
                    data: convertJSONArrayToAutocomplete(data, "name"),
                    onAutocomplete: function (val) {
                        var selectedHospital = $.grep(HOSPITALS, function (e) { return e.name === val });
                        episode.hospital_id = selectedHospital[0].hospital_id;
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

    populateEpisodes = function (patientId) {
        $.getJSON(location.origin + "/patients/" + patientId + "/episodes", function (data) {
            if (data && data.length > 0) {
                var episodeContainer = document.getElementById("previous-episodes");
                $.each(data, function () {
                    var value = this.date + " - " + this.reason_referral,
                        valueContainer = document.createElement("a");

                    valueContainer.className = "collection-item";
                    valueContainer.innerHTML = value;
                    episodeContainer.appendChild(valueContainer);
                });
            } else {
                episodeContainer.innerHTML = "No episodes for this patient.";
            }
            episodeContainer.className = "collection";
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

    setupHandwritingButtons = function () {
        $(".textarea-btn").click(function () {
            var inputField = $(this).parent().children("textarea");

            if (inputField && inputField.length === 1) {
                FormAPI.handwriting.openHandwritingFrame(inputField[0].id);
            }
        });

        $("#handwriting-save").click(function () {
            var value = document.querySelector("myscript-text-web").firstcandidate;
            FormAPI.handwriting.recieveHandwritingValue(value);
        });

        $("#handwriting-back").click(function () { FormAPI.handwriting.closeHandwritingFrame(); });
    }

    startEpisode = function () {
        var source = $("#observations_source_referral").val(),
            reason = $("#observations_referral_reason").val();


        if (!episode || !episode.patient_id || !episode.hospital_id || !episode.gp_id) {
            alert("cant create episode");
        }

        episode.source_referral = source;
        episode.reason_referral = reason;
        episode.date = moment().format("YYYY-MM-DD");
        episode.time = moment().format("HH:MM:SS");

        $.post(
            location.origin + "/patients/" + episode.patient_id + "/episodes",
            episode,
            function (data) {
                episode.episode_id = data.episode_id;
                // Now that a episode has begun, the patient and episode fields are read-only
                $("#observations-form input:disabled").prop("disabled", false);
                $("#observations-form button:disabled").prop("disabled", false);
                $("#patient-form input").prop("disabled", true);
                $("#patient-form button").prop("disabled", true);

                $("#observations_referral_reason").prop("disabled", true);
                $("#observations_source_referral").prop("disabled", true);

                $("#start-episode").prop("disabled", true);

                FormAPI.tabs.updateCompletion();
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
        headerElement.className = "selection-header";
        headerElement.innerHTML = data[header];

        var subtextElement = document.createElement("span");
        subtextElement.className = "selection-subtext";
        subtextElement.innerHTML = data[subtext];

        container.appendChild(headerElement);
        container.appendChild(subtextElement);

        return container;
    }

    FormAPI.modals.select = function () {
        $(".modal-selector").removeClass().addClass("modal-selector card-panel blue");

        $(".modal-main").data("id", this.dataset.id);
        this.className = "modal-selector card-panel teal";
    }

    FormAPI.modals.closeModal = function () {
        $(".modal-main").empty();
        $(".modal-title").empty();

        $("#shared-modal").modal("close");
    }

    FormAPI.data = {};

    FormAPI.data.populate = function (data, entityName) {
        var selectedFields = FormAPI.data.getRelatedEntityFields(entityName);

        for (var attribute in data) {
            if (data.hasOwnProperty(attribute)) {
                var relatedField = $.grep(selectedFields, function (e) {
                    return e.dataset.field == attribute;
                });

                if (relatedField && relatedField.length >= 1) {
                    $.each(relatedField, function () {
                        if (this.type === "date") {
                            var dataInput = $("#" + this.id).pickadate(),
                                picker = dataInput.packadate("picker"),
                                formattedDate = moment(data[attribute]).format("YYYY-MM-DD");

                            picker.set("select", formattedDate, { format: "yyyy-mm-dd" });
                        } else {
                            this.value = data[attribute];
                        }
                    });
                }
            }
        }

        Materialize.updateTextFields();
    }

    FormAPI.data.getDataFromForm = function (entityName) {
        var selectedFields = FormAPI.data.getRelatedEntityFields(entityName),
            entityData = {};

        $.each(selectedFields, function () {
            if (this.value) {
                if (this.type === "checkbox") {
                    // Convert true/false to 1/0
                    entityData[this.dataset.field] = this.checked ? 1 : 0;
                } else if (this.type === "radio") {
                    entityData[this.dataset.field] = $("input[name=" + this.name + "]:checked").val();
                } else {
                    entityData[this.dataset.field] = this.value;
                }
            }
        });

        return entityData;
    }

    FormAPI.data.getRelatedEntityFields = function (entityName) {
        var selectedInputFields = $.grep($("input"), function (e) {
            return e.dataset.entity === entityName;
        }),
            selectedSelectionFields = $.grep($("select"), function (e) {
                return e.dataset.entity === entityName;
            }),
            selectedTextareaFields = $.grep($("textarea"), function (e) {
                return e.dataset.entity === entityName;
            }),
            selectedFields = selectedInputFields.concat(selectedSelectionFields).concat(selectedTextareaFields);

        return selectedFields;
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
                        FormAPI.tabs.currentTab = tab.name;
                    }
                });
            }
        } else {
            console.error("Tab is not set.");
        }
    }

    FormAPI.handwriting = {};
    FormAPI.handwriting.currentInputField;

    FormAPI.handwriting.openHandwritingFrame = function (inputFieldId) {
        if (!FormAPI.handwriting.currentInputField) {
            $("#handwriting-frame").removeClass("hidden");
            $("main").addClass("hidden");

            FormAPI.handwriting.currentInputField = inputFieldId;
        }
    }

    FormAPI.handwriting.recieveHandwritingValue = function (val) {
        alert(val);
        if (FormAPI.handwriting.currentInputField) {
            $("#" + FormAPI.handwriting.currentInputField).val(val);

            FormAPI.handwriting.closeHandwritingFrame();
        }
    }

    FormAPI.handwriting.closeHandwritingFrame = function () {
        $("#handwriting-frame").addClass("hidden");
        $("main").removeClass("hidden");

        FormAPI.handwriting.currentInputField = null;
    }

    $('select').material_select();

    $(".tab a").click(FormAPI.tabs.changeTab);

    getFormHtml(TABS[0].url).done(function (data) {
        $("#patient-form").append(data);
        TABS[0].onload();
    });
});