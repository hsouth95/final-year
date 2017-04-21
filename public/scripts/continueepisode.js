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
                $("input").prop("disabled", false);

                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 200
                });
                $("select").material_select();
                $("#start-episode").click(startEpisode);
                $("#add-observations").click(addObservations);
                $("#add-examination").click(addExamination);

                $("img").click(FormAPI.drawing.openDrawingFrame);

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
                $("#add-medication").click(addMedication);
                populateDrugs();
            },
            completedAttributes: [
                "current_medications"
            ]
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

                $("#add-blood-results").click(addBloodResults);
                $("#add-urine-results").click(addUrineResults);
                $("#add-imaging-results").click(addImagingResults);
            },
            completedAttributes: [
                "blood_results_id",
                "urine_results_id",
                "imaging_results_id"
            ]
        },
        {
            name: "diagnosis",
            loaded: false,
            url: location.origin + "/view/diagnosis",
            onload: function () {
                // populate diagnosis list
                populateDiagnosis();

                $("#add-diagnosis").click(addDiagnosis);
                $("#complete-episode").click(completeEpisode);
            },
            completedAttributes: [
                "problem_list_id",
            ]
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
                setCachedEpisode(data.patient_id);
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
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    displayObservations = function (observations) {
        var observationsValues = document.createElement("div");
        observationsValues.className = "col s2";

        for (var attribute in observations) {
            if (observations.hasOwnProperty(attribute)) {
                var observationProperty = document.createElement("div");
                observationProperty.innerHTML = observations[attribute];

                observationsValues.appendChild(observationProperty);
            }
        }

        document.getElementById("observations-results").appendChild(observationsValues);
    }

    addExamination = function () {
        var examinations = FormAPI.data.getDataFromForm("examination"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/examinations";

        var drawings = $("img[data-entity=examination]");

        $.each(drawings, function () {
            if (this.dataset.savedFileName) {
                examinations[this.dataset.field] = this.dataset.savedFileName;
            }
        });

        $.post(url, examinations, function (data) {
            episode.examination_id = data.examination_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=examination]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    addHistory = function () {
        var history = FormAPI.data.getDataFromForm("history"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/history";

        $.post(url, history, function (data) {
            episode.history_id = data.history_id;
            FormAPI.tabs.updateCompletion();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    addMedication = function () {
        var medicationData = FormAPI.data.getDataFromForm("current_medication"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/currentmedication";

        $.post(url, medicationData, function (data) {
            if (episode && !episode.current_medications) {
                episode.current_medications = [];
            }
            episode.current_medications.push(medicationData.medication_id);

            var drugName = $("#drug-name").val(),
                dose = $("#dose").val(),
                route = $("#route").val(),
                currentMedicationToAdd = [];

            currentMedicationToAdd.push(drugName);
            currentMedicationToAdd.push(dose);
            currentMedicationToAdd.push(route);
            currentMedicationToAdd.push(medicationData.frequency);
            currentMedicationToAdd.push(medicationData.details);

            FormAPI.data.addTableRow("current_medication_table", currentMedicationToAdd);

            $("#current_medication_table input").val("");

            FormAPI.tabs.updateCompletion();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    addBloodResults = function () {
        var bloodResults = FormAPI.data.getDataFromForm("blood_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/bloodresults";

        $.post(url, bloodResults, function (data) {
            episode.blood_results_id = data.blood_results_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=blood_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    addUrineResults = function () {
        var urineResults = FormAPI.data.getDataFromForm("urine_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/urineresults";

        $.post(url, urineResults, function (data) {
            episode.urine_results_id = data.urine_results_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=urine_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    addImagingResults = function () {
        var imagingResults = FormAPI.data.getDataFromForm("imaging_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/imagingresults";

        $.post(url, imagingResults, function (data) {
            episode.imaging_results_id = data.imaging_results_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=imaging_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    addDiagnosis = function () {
        var diagnosis = FormAPI.data.getDataFromForm("problem_list"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/problemlist";

        $.post(url, diagnosis, function (data) {
            episode.problem_list_id = data.problem_list_id;
            FormAPI.tabs.updateCompletion();
            $("input[data-entity=problem_list]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    getFormHtml = function (url) {
        return $.get(url)
            .fail(function (err) {
                FormAPI.error.showErrorDialog(err.message);
            });
    };

    completeEpisode = function () {
        if (episode) {
            $.post(location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/complete", function () {
                alertify.success("Episode successfully completed.");
                $("form input").val("");
            }).fail(function (err) {
                console.log(err);
            });
        }
    }

    populateHospitals = function () {
        $.getJSON(location.origin + "/hospitals", function (data) {
            HOSPITALS = data;
            $("input#hospital_name").autocomplete({
                data: convertJSONArrayToAutocomplete(data, "name"),
                onAutocomplete: function (val) {
                    var selectedHospital = $.grep(HOSPITALS, function (e) { return e.name === val });
                    episode.hospital_id = selectedHospital[0].hospital_id;
                    FormAPI.tabs.updateCompletion();
                }
            });
        }).fail(function () {
            FormAPI.error.showErrorDialog("Cannot populate hospitals...");
        });
    };

    populateDrugs = function () {
        $.getJSON(location.origin + "/medication").done(function (data) {
            var drugData = convertJSONArrayToAutocomplete(data, "name");
            $("input#drug-name").autocomplete({
                data: drugData,
                onAutocomplete: function (val) {
                    var medication = $.grep(data, function (e) {
                        return e.name === val;
                    });

                    if (medication) {
                        $("#drug-id").val(medication[0].medication_id);
                        $("#route").val(medication[0].route);
                        $("#dose").val(medication[0].dose);
                    }
                }
            });
        }).fail(function () {
            FormAPI.error.showErrorDialog("Cannot populate the medication");
        })
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
        }).fail(function () {
            FormAPI.error.showErrorDialog("Cannot populate the diagnosis list");
        });
    }

    populateEpisodes = function (patientId) {
        $.getJSON(location.origin + "/patients/" + patientId + "/episodes", function (data) {
            if (data && data.length > 0) {
                if (!data[data.length - 1].completed) {
                    populateCurrentEpisode(data[data.length - 1]);
                }

                var episodeContainer = document.getElementById("previous-episodes");
                $.each(data, function () {
                    if (this.completed) {
                        var value = this.date.substring(0, 10) + " - " + this.reason_referral,
                            valueContainer = document.createElement("a");

                        valueContainer.className = "collection-item";
                        valueContainer.href = location.origin + "/viewresult?episodeid=" + this.episode_id + "&patientid=" + this.patient_id;
                        valueContainer.innerHTML = value;
                        episodeContainer.appendChild(valueContainer);
                    }
                });
            } else {
                episodeContainer.innerHTML = "No episodes for this patient.";
            }
            episodeContainer.className = "collection";
        }).fail(function () {
            FormAPI.error.showErrorDialog("Unable to populate the patient's latest episodes.");
        });
    }

    populateCurrentEpisode = function (currentEpisode) {
        if (currentEpisode && currentEpisode.episode_id && currentEpisode.patient_id && currentEpisode.gp_id) {

            episode.episode_id = currentEpisode.episode_id;
            episode.gp_id = currentEpisode.gp_id;
            episode.patient_id = currentEpisode.patient_id;
            episode.hospital_id = currentEpisode.hospital_id;


            var hospital = $.grep(HOSPITALS, function (e) {
                return e.hospital_id === episode.hospital_id;
            });

            if (hospital) {
                $("#hospital_name").val(hospital[0].name);
            }

            FormAPI.tabs.updateCompletion();

            var episodeUrl = location.origin + "/patients/" + currentEpisode.patient_id + "/episodes/" + currentEpisode.episode_id;

            FormAPI.data.populate(currentEpisode, "clinical_episode");

            $.getJSON(location.origin + "/gp/" + currentEpisode.gp_id, function (data) {
                FormAPI.data.populate(data, "gp");
            });

            $.getJSON(episodeUrl + "/observations", function (data) {
                if (data) {
                    episode.observations = data;
                }
                FormAPI.data.populate(data, "observations");
            });

            $.getJSON(episodeUrl + "/examinations", function (data) {
                if (data) {
                    episode.examination_id = data[0].examination_id;
                }

                FormAPI.data.populate(data, "examination");
            });

            $.getJSON(episodeUrl + "/history", function (data) {
                if (data && data.length === 1) {
                    episode.history_id = data[0].history_id;
                    FormAPI.data.populate(data, "history");
                }
            });

            $.getJSON(episodeUrl + "/bloodresults", function (data) {
                if (data && data.length === 1) {
                    episode.blood_results_id = data[0].blood_results_id;
                    FormAPI.data.populate(data, "blood_results");
                }
            });

            $.getJSON(episodeUrl + "/urineresults", function (data) {
                if (data && data.length === 1) {
                    episode.urine_results_id = data[0].urine_results_id;
                    FormAPI.data.populate(data, "urine_results");
                }
            });
            $.getJSON(episodeUrl + "/imagingresults", function (data) {
                if (data && data.length === 1) {
                    episode.imaging_results_id = data[0].imaging_results_id;
                    FormAPI.data.populate(data, "imaging_results");
                }
            });
        }
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
            FormAPI.error.showErrorDialog("All required fields to create an episode are not present.");
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
            }).fail(function () {
                FormAPI.error.showErrorDialog("Failed to create the clinical episode, please try again.");
            });
    }

    checkCachedEpisode = function () {
        if (sessionStorage.getItem("patientId")) {
            var patientUrl = location.origin + "/patients/" + sessionStorage.getItem("patientId");

            $.getJSON(patientUrl, function (data) {
                if (data) {
                    FormAPI.data.populate(data, "patient");

                    episode.patient = data;
                    episode.patient_id = data.patient_id;

                    FormAPI.tabs.updateCompletion();

                    populateEpisodes(data.patient_id);
                }
            }).fail(function () {
                FormAPI.error.showErrorDialog("Failed to get cached patient, please enter it again.");
            });

        }
    }

    setCachedEpisode = function (patientId) {
        // TODO: replace with episode id and find relevant fields
        sessionStorage.setItem("patientId", patientId);
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

        if (data instanceof Array && data.length === 1) {
            data = data[0];
        } else if (data instanceof Array && data.length > 1) {
            data = data[0];
            console.log("Data contains more than one value.");
        }

        for (var attribute in data) {
            if (data.hasOwnProperty(attribute)) {
                var relatedField = $.grep(selectedFields, function (e) {
                    return e.dataset.field == attribute;
                }),
                    relatedImage = $.grep($("img"), function (e) {
                        return e.dataset.field == attribute;
                    });

                if (relatedField && relatedField.length >= 1) {
                    if (relatedField[0].type === "radio" && data[attribute] !== null) {
                        $.each(relatedField, function () {
                            if (parseInt(this.value) === data[attribute]) {
                                this.checked = true;
                                return false;
                            }
                        });
                    } else {
                        $.each(relatedField, function () {
                            FormAPI.data.populateField(this, data[attribute]);
                        });
                    }
                } else if (relatedImage && relatedImage.length === 1) {
                    if (data[attribute]) {
                        relatedImage[0].src = "drawings/" + data[attribute];
                    }
                }
            }
        }

        Materialize.updateTextFields();
    }

    FormAPI.data.populateField = function (element, value) {
        switch (element.type) {
            case "date":
                var dataInput = $("#" + element.id).pickadate(),
                    picker = dataInput.packadate("picker"),
                    formattedDate = moment(value).format("YYYY-MM-DD");

                picker.set("select", formattedDate, { format: "yyyy-mm-dd" });

                break;
            case "checkbox":
                element.checked = value;
                break;
            default:
                element.value = value;
                break;
        }
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
        var comparorFunction = function (e) {
            return e.dataset.entity === entityName;
        },
            selectedInputFields = $.grep($("input"), comparorFunction),
            selectedSelectionFields = $.grep($("select"), comparorFunction),
            selectedTextareaFields = $.grep($("textarea"), comparorFunction),
            selectedFields = selectedInputFields.concat(selectedSelectionFields).concat(selectedTextareaFields);

        return selectedFields;
    }

    FormAPI.data.addTableRow = function (elementId, data) {
        var row = "<tr>";
        $.each(data, function () {
            row += "<td>" + this + "</td>";
        });
        row += "</tr>";

        $("#" + elementId + " > tbody:last-child").append(row);
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

            FormAPI.tabs.currentTab = tab.name;
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
        if (FormAPI.handwriting.currentInputField) {
            $("#" + FormAPI.handwriting.currentInputField).val(val);
            Materialize.updateTextFields();
            FormAPI.handwriting.closeHandwritingFrame();
        }
    }

    FormAPI.handwriting.closeHandwritingFrame = function () {
        $("#handwriting-frame").addClass("hidden");
        $("main").removeClass("hidden");

        FormAPI.handwriting.currentInputField = null;
    }

    FormAPI.drawing = {};

    FormAPI.drawing.openDrawingFrame = function (element) {
        // Click encapsulates the element with the currentTarget of the event
        var clickedElement = element.currentTarget,
            fileUrl = location.origin + "/drawing";

        if (drawingFrame) {
            drawingFrame.openFrame(clickedElement.src, function (data) {
                var postData = {};
                postData.drawing = data;
                postData.fileName = clickedElement.dataset.field + "-" + episode.episode_id + ".jpg";

                $.post(fileUrl, postData, function (response) {
                    clickedElement.src = data;
                    clickedElement.dataset.savedFileName = response.fileName;
                }).fail(function (e) {
                    FormAPI.error.showErrorDialog("Failed to upload the drawing, please try again.");
                });
            });
            $("#drawing-frame").removeClass("hidden");
        }
    };

    FormAPI.error = {};

    FormAPI.error.showErrorDialog = function (errorMessage) {
        alertify.error(errorMessage);
    }

    $('select').material_select();

    $(".tab a").click(FormAPI.tabs.changeTab);


    $.each(TABS, function (i, e) {
        var tab = e;
        getFormHtml(tab.url).done(function (data) {
            $("#" + tab.name + "-form").append(data);
            tab.onload();
            TABS[i].loaded = true;
        });
    });

    // Check to see if there is a cached patient
    checkCachedEpisode();
});