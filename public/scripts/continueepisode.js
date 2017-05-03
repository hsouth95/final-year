$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    /**
     * An array of the different tabs with values.
     * @member name - The name of the tab - this needs to match the prefix of the id of the tab and corresponding form:
     * e.g. name: history = <li id="history-tab">
     * @member url - The URL of the form html
     * @member loaded - Boolean flag to indicate if the tab has been loaded yet
     * @member onload - The function to be run once the tab HTML is loaded, the event handlers for buttons and other such elements should be set here
     * @member completedAttributes - An array of all the data attributes that need to be set on the episode before this tab can be seen as completed
     */
    var TABS = [
        {
            name: "patient",
            url: location.origin + "/view/patient",
            loaded: true,
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 200,
                    format: "yyyy-mm-dd"
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
                    selectYears: 200,
                    format: "yyyy-mm-dd"
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
                    selectYears: 200,
                    format: "yyyy-mm-dd"
                });

                $("select").material_select();
                $("#add-medication").click(addCurrentMedication);
                populateDrugs("current_medication_table");
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

                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 2,
                    format: "yyyy-mm-dd"
                });

                $("#add-drugtreatment").click(addDrugTreatment);
                $("#add-treatment").click(addTreatment);

                populateDrugs("drug-treatment-table");
            },
            completedAttributes: [
                "drug_treatments",
                "treatment_id"
            ]
        },
        {
            name: "results",
            loaded: false,
            url: location.origin + "/view/results",
            onload: function () {
                $('.datepicker').pickadate({
                    selectMonths: true,
                    selectYears: 2,
                    format: "yyyy-mm-dd"
                });

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
                $("#add-diagnosis").click(addDiagnosis);
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

    /**
     * Creates the query to find the patient and opens the selective modal
     */
    findPatient = function () {
        var patientNumber = $("#patient_number").val();

        // Clear the current patient information
        FormAPI.data.clearAll();

        fillPatientModal(patientNumber);
    }

    /**
     * Creates the query to find the GP and opens the selective modal
     */
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

    /**
     * Creates a modal with all the patient's that fulfill the criteria set by the user
     * @argument patientNumber - The value entered by the user
     */
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

                FormAPI.actionBar.updatePatient(data.firstname + " " + data.surname);

                FormAPI.data.updateEpisodeProgress();

                populateEpisodes(data.patient_id);
                setCachedEpisode(data.patient_id);
            }
        });

        FormAPI.modals.openSelectionModal();
    }

    /**
     * Creates a modal with all the GP's that fulfill the criteria set by the user
     * @argument query - Query based on the fields filled out
     */
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
                FormAPI.data.updateEpisodeProgress();
            }
        });

        FormAPI.modals.openSelectionModal();
    }

    /**
     * Handles the adding of a set of observations
     */
    addObservations = function () {
        if (!FormAPI.data.isInputEntityValid("observations")) {
            return;
        }

        var observations = FormAPI.data.getDataFromForm("observations"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/observations";
        $.post(url, observations, function (data) {
            // Can have multiple sets of observations, therefore, store as an array
            if (!episode.observations) {
                episode.observations = [];
            }

            observations.date = moment().format("YYYY-MM-DD");

            displayObservations(observations);

            episode.observations.push(data.observation_id);
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=observations]").val("");
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Displays all observations that belong to this clinical episode
     */
    displayAllObservations = function () {
        if (episode.observations && episode.observations.length >= 1) {
            $.each(episode.observations, function () {
                displayObservations(this);
            });

            FormAPI.data.updateEpisodeProgress();
        }
    }

    /**
     * Displays the observation values after they have been added
     * @argument observations - The observations values
     */
    displayObservations = function (observations) {
        // The fields added in the order they should appear vertically
        var fields = [
            "date",
            "bp_systolic",
            "bp_diastolic",
            "pulse",
            "temperature",
            "respiratory_rate",
            "avpu",
            "news_score"
        ];

        // If there are no observations currently, populate the headings
        if ($("#observations-results").children().length === 0) {
            displayObservationHeaders();
        }

        var observationsValues = document.createElement("div");
        observationsValues.className = "col s2";

        for (var attribute in fields) {
            var fieldName = fields[attribute],
                observationProperty = document.createElement("div");
            observationProperty.className = "observation-result-element";

            if (observations.hasOwnProperty(fieldName) && observations[fieldName] !== null) {
                // Handle the date differently
                if (fieldName === "date") {
                    observationProperty.innerHTML = FormAPI.data.filterDate(observations[fieldName]);
                } else {
                    observationProperty.innerHTML = observations[fieldName];
                }
            } else {
                observationProperty.innerHTML = "-";
            }

            observationsValues.appendChild(observationProperty);
        }

        document.getElementById("observations-results").appendChild(observationsValues);
    }

    /**
     * Displays the observation value titles to indicate which each value is after they have been added
     */
    displayObservationHeaders = function () {
        // The headings in the order they should appear
        var headings = [
            "Date",
            "BP Systolic",
            "BP Diastolic",
            "Pulse",
            "Temperature",
            "Respiratory Rate",
            "AVPU",
            "NEWS Score"
        ];

        var observationHeaders = document.createElement("div");
        observationHeaders.className = "col s5 observation-headers";

        $.each(headings, function () {
            var observationProperty = document.createElement("div");
            observationProperty.className = "observation-result-element";
            observationProperty.innerHTML = this;

            observationHeaders.appendChild(observationProperty);
        });

        document.getElementById("observations-results").appendChild(observationHeaders);
    }

    /**
     * Handles the adding of the examinations to the database
     */
    addExamination = function () {
        if (!FormAPI.data.isInputEntityValid("examination")) {
            return;
        }

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
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=examination]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of the history to the database
     */
    addHistory = function () {
        if (!FormAPI.data.isInputEntityValid("history")) {
            return;
        }

        var history = FormAPI.data.getDataFromForm("history"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/history";

        $.post(url, history, function (data) {
            episode.history_id = data.history_id;
            FormAPI.data.updateEpisodeProgress();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of the current medication to the database
     */
    addCurrentMedication = function () {
        if (!FormAPI.data.isInputEntityValid("current_medication")) {
            return;
        }

        var medicationData = FormAPI.data.getDataFromForm("current_medication"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/currentmedication";

        $.post(url, medicationData, function (data) {
            if (episode && !episode.current_medications) {
                episode.current_medications = [];
            }
            episode.current_medications.push(medicationData.medication_id);

            var drugName = $("#current_medication_table #drug-name").val(),
                dose = $("#current_medication_table #dose").val(),
                measure = $("#current_medication_table #measure").val(),
                route = $("#current_medication_table #route").val(),
                frequency = $("#current_medication_table #frequency").find(":selected").text(),
                currentMedicationToAdd = [];

            currentMedicationToAdd.push(drugName);
            currentMedicationToAdd.push(dose);
            currentMedicationToAdd.push(measure);
            currentMedicationToAdd.push(route);
            currentMedicationToAdd.push(frequency);
            currentMedicationToAdd.push(medicationData.details);
            currentMedicationToAdd.push(medicationData.date);

            FormAPI.data.addTableRow("current_medication_table", currentMedicationToAdd);

            $("#current_medication_table input").val("");
            $("#current_medication_table select").prop("selectedIndex", 0);

            FormAPI.data.updateEpisodeProgress();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of a selected medication to the patients drug treatment list
     */
    addDrugTreatment = function () {
        if (!FormAPI.data.isInputEntityValid("drug_treatment")) {
            return;
        }

        var drugTreatmentData = FormAPI.data.getDataFromForm("drug_treatment"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/drugtreatment";

        $.post(url, drugTreatmentData, function (data) {
            if (episode && !episode.drugtreatments) {
                episode.drug_treatments = [];
            }
            episode.drug_treatments.push(drugTreatmentData.medication_id);

            var drugName = $("#drug-treatment-table #drug-name").val(),
                dose = $("#drug-treatment-table #dose").val(),
                measure = $("#drug-treatment-table #measure").val(),
                route = $("#drug-treatment-table #route").val(),
                frequency = $("#current_medication_table #frequency").find(":selected").text(),
                drugTreatmentToAdd = [];

            // Add all the information in order it should appear to the user
            drugTreatmentToAdd.push(drugName);
            drugTreatmentToAdd.push(dose);
            drugTreatmentToAdd.push(measure);
            drugTreatmentToAdd.push(route);
            drugTreatmentToAdd.push(frequency);
            drugTreatmentToAdd.push(drugTreatmentData.details);
            drugTreatmentToAdd.push(drugTreatmentData.date);

            FormAPI.data.addTableRow("drug-treatment-table", drugTreatmentToAdd);

            $("#drug-treatment-table input").val("");

            FormAPI.data.updateEpisodeProgress();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of the treatment information
     */
    addTreatment = function () {
        if (!FormAPI.data.isInputEntityValid("treatment")) {
            return;
        }

        var treatment = FormAPI.data.getDataFromForm("treatment"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/treatment";

        $.post(url, treatment, function (data) {
            episode.treatment_id = data.treatment_id;
            FormAPI.data.updateEpisodeProgress();
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of the blood results to the database
     */
    addBloodResults = function () {
        if (!FormAPI.data.isInputEntityValid("blood_results")) {
            return;
        }

        var bloodResults = FormAPI.data.getDataFromForm("blood_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/bloodresults";

        $.post(url, bloodResults, function (data) {
            episode.blood_results_id = data.blood_results_id;
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=blood_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog(err.message);
        });
    }

    /**
     * Handles the adding of the urine results to the database
     */
    addUrineResults = function () {
        if (!FormAPI.data.isInputEntityValid("urine_results")) {
            return;
        }

        var urineResults = FormAPI.data.getDataFromForm("urine_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/urineresults";

        $.post(url, urineResults, function (data) {
            episode.urine_results_id = data.urine_results_id;
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=urine_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    /**
     * Handles the adding of the imaging results to the database
     */
    addImagingResults = function () {
        if (!FormAPI.data.isInputEntityValid("imaging_results")) {
            return;
        }

        var imagingResults = FormAPI.data.getDataFromForm("imaging_results"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/imagingresults";

        $.post(url, imagingResults, function (data) {
            episode.imaging_results_id = data.imaging_results_id;
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=imaging_results]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    /**
     * Handles the adding of the diagnosis values to the database
     */
    addDiagnosis = function () {
        if (!FormAPI.data.isInputEntityValid("problem_list")) {
            return;
        }

        var diagnosis = FormAPI.data.getDataFromForm("problem_list"),
            url = location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/problemlist";

        $.post(url, diagnosis, function (data) {
            episode.problem_list_id = data.problem_list_id;
            FormAPI.data.updateEpisodeProgress();
            $("input[data-entity=problem_list]").prop("disabled", true);
        }).fail(function (err) {
            FormAPI.error.showErrorDialog("Error submitting Urine Results");
        });
    }

    /**
     * Loads the HTML of a form
     */
    getFormHtml = function (url) {
        return $.get(url)
            .fail(function (err) {
                FormAPI.error.showErrorDialog(err.message);
            });
    };

    /**
     * Completes the episode to show that this clinical episode has concluded
     */
    completeEpisode = function () {
        if (episode) {
            $.post(location.origin + "/patients/" + episode.patient_id + "/episodes/" + episode.episode_id + "/complete", function () {
                alertify.success("Episode successfully completed.");
                FormAPI.data.clearAll();
                FormAPI.actionBar.clear();
            }).fail(function (err) {
                console.log(err);
            });
        }
    }

    /**
     * Populates the hospitals on the patient tab
     */
    populateHospitals = function () {
        $.getJSON(location.origin + "/hospitals", function (data) {
            HOSPITALS = data;
            $("input#hospital_name").autocomplete({
                data: convertJSONArrayToAutocomplete(data, "name"),
                onAutocomplete: function (val) {
                    var selectedHospital = $.grep(HOSPITALS, function (e) { return e.name === val });
                    episode.hospital_id = selectedHospital[0].hospital_id;
                    FormAPI.data.updateEpisodeProgress();
                }
            });
        }).fail(function () {
            FormAPI.error.showErrorDialog("Cannot populate hospitals...");
        });
    };

    /**
     * Populates the drugs table on the medication tab
     * @argument 
     */
    populateDrugs = function (tableId) {
        $.getJSON(location.origin + "/medication").done(function (data) {
            var drugData = convertJSONArrayToAutocomplete(data, function (drug) {
                return drug.name + " - " + drug.dose + drug.measure + " " + drug.route;
            });

            $("#" + tableId + " input#drug-name").autocomplete({
                data: drugData,
                onAutocomplete: function (val) {
                    var medication = $.grep(data, function (e) {
                        // As autocomplete won't store the ID we have to compare the formatted string
                        return e.name + " - " + e.dose + e.measure + " " + e.route === val;
                    });

                    // Populate the table with the values selected e.g. 500mg on selecting Paracetamol
                    if (medication) {
                        $("#" + tableId + " #drug-name").val(medication[0].name);
                        $("#" + tableId + " #drug-id").val(medication[0].medication_id);
                        $("#" + tableId + " #measure").val(medication[0].measure);
                        $("#" + tableId + " #route").val(medication[0].route);
                        $("#" + tableId + " #dose").val(medication[0].dose);
                        $("#" + tableId + " #frequency option[value='" + medication[0].frequency + "']").prop("selected", true);
                    }
                }
            });
        }).fail(function () {
            FormAPI.error.showErrorDialog("Cannot populate the medication");
        })
    };

    /**
     * Retrieves and populates both the previous and current episode of a patient
     * @argument patientId - The ID of the patient to find the episodes for
     */
    populateEpisodes = function (patientId) {
        $("previous-episodes").empty();
        $.getJSON(location.origin + "/patients/" + patientId + "/episodes", function (data) {
            // Check the most recent episode to see if it is still in progress
            var episodeContainer = document.getElementById("previous-episodes");

            if (data && data.length > 0) {
                if (!data[data.length - 1].completed) {
                    populateCurrentEpisode(data[data.length - 1]);
                }

                // For the rest of the episodes append them into the collection on the form
                $.each(data, function () {
                    if (this.completed) {
                        var value = FormAPI.data.filterDate(this.date) + " - " + this.reason_referral,
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

    /**
     * Populates all of the saved data when a currently in progress episode is found
     * @argument currentEpisode - The episode that has been found
     */
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

            FormAPI.actionBar.updateEpisode(FormAPI.data.filterDate(currentEpisode.date) + " - " + currentEpisode.reason_referral);
            FormAPI.data.updateEpisodeProgress();

            var episodeUrl = location.origin + "/patients/" + currentEpisode.patient_id + "/episodes/" + currentEpisode.episode_id;

            FormAPI.data.populate(currentEpisode, "clinical_episode");

            $.getJSON(location.origin + "/gp/" + currentEpisode.gp_id, function (data) {
                FormAPI.data.populate(data, "gp");
            });

            // Observations has a unique vertical table therefore fire off its own function after populating fields
            $.getJSON(episodeUrl + "/observations", function (data) {
                if (data && data.length >= 1) {
                    episode.observations = data;

                    displayAllObservations();
                }
            });

            // Below are simple input fields therefore treat generically
            FormAPI.data.populateData(episodeUrl + "/examinations", "examination_id", "examination");
            FormAPI.data.populateData(episodeUrl + "/history", "history_id", "history");
            FormAPI.data.populateData(episodeUrl + "/bloodresults", "blood_results_id", "blood_results");
            FormAPI.data.populateData(episodeUrl + "/urineresults", "urine_results_id", "urine_results");
            FormAPI.data.populateData(episodeUrl + "/imagingresults", "imaging_results_id", "imaging_results");
            FormAPI.data.populateData(episodeUrl + "/treatment", "treatment_id", "treatment");
            FormAPI.data.populateData(episodeUrl + "/problemlist", "problem_list_id", "problem_list");

            // Below are tables, therefore add to these to these tables
            $.getJSON(episodeUrl + "/currentmedication", function (data) {
                if (data && data.length >= 1) {
                    episode.current_medications = data;
                    addToMedicationTable(data, "current_medication_table");

                    FormAPI.data.updateEpisodeProgress();
                }
            });

            $.getJSON(episodeUrl + "/drugtreatment", function (data) {
                if (data && data.length >= 1) {
                    episode.drug_treatments = data;
                    addToMedicationTable(data, "drug-treatment-table");

                    FormAPI.data.updateEpisodeProgress();
                }
            });
        }
    }

    /**
     * Due to the way that materializecss handles data for autocomplete a conversion is needed
     * @argument data - The JSON array to parse
     * @argument comparor - Either a attribute name or a function to retireve the value e.g. name + age
     * @see http://materializecss.com/forms.html#autocomplete
     */
    convertJSONArrayToAutocomplete = function (data, comparor) {
        var convertedData = {};

        // Materialize looks at attribute name, therefore convert array into one object
        for (var i = 0; i < data.length; i++) {
            var fieldName = null;
            if (typeof comparor === "function") {
                fieldName = comparor(data[i]);
            } else {
                if (data[i].hasOwnProperty(comparor)) {
                    fieldName = data[i][comparor];
                }
            }

            convertedData[fieldName] = null;
        }

        return convertedData;
    }

    /**
     * Adds the medication data to a table in a specific order
     * @argument data - The data to add to the table
     * @argument elementId - The table being added to
     */
    addToMedicationTable = function (data, elementId) {
        var orderedAttributes = [
            "name",
            "dose",
            "measure",
            "route",
            "frequency",
            "details",
            "date"
        ];

        if (data && data.length >= 1) {
            $.each(data, function () {
                // Convert each medication object to an array for displaying
                var convertedData = [];
                for (var attribute in orderedAttributes) {
                    var fieldName = orderedAttributes[attribute];
                    if (this.hasOwnProperty(fieldName)) {
                        if (fieldName === "frequency") {
                            convertedData.push(getMedicationFrequencyValue(this[fieldName]));
                        } else {
                            convertedData.push(this[fieldName]);
                        }
                    } else {
                        convertedData.push("-");
                    }
                }

                FormAPI.data.addTableRow(elementId, convertedData)
            });
        }
    }

    getMedicationFrequencyValue = function (value) {
        var values = [
            null,
            "Once Daily",
            "Twice Daily",
            "Three Times Daily",
            "Four Times Daily",
            "PRN"
        ];

        if (value <= values.length - 1 && value > 0) {
            return values[value];
        } else {
            return null;
        }
    }

    /**
     * Creates the clinical episode in the database and removes the blocks on the forms
     */
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

                FormAPI.data.updateEpisodeProgress();
            }).fail(function () {
                FormAPI.error.showErrorDialog("Failed to create the clinical episode, please try again.");
            });
    }

    /**
     * Checks the contents of the session storage and populates the patient/episode accordingly
     */
    checkCachedEpisode = function () {
        if (sessionStorage.getItem("patientId")) {
            var patientUrl = location.origin + "/patients/" + sessionStorage.getItem("patientId");

            $.getJSON(patientUrl, function (data) {
                if (data && data.length === 1) {
                    data = data[0];
                    FormAPI.data.populate(data, "patient");

                    episode.patient = data;
                    episode.patient_id = data.patient_id;

                    FormAPI.actionBar.updatePatient(data.firstname + " " + data.surname);
                    FormAPI.data.updateEpisodeProgress();

                    populateEpisodes(data.patient_id);
                }
            }).fail(function () {
                FormAPI.error.showErrorDialog("Failed to get cached patient, please enter it again.");
            });

        }
    }

    /**
     * Store a unique identifier in the session storage which is deleted on browser close
     */
    setCachedEpisode = function (patientId) {
        // TODO: replace with episode id and find relevant fields
        sessionStorage.setItem("patientId", patientId);
    }

    FormAPI.modals = {};

    /**
     * Builds a modal in which the user can select the required value e.g. select the patient
     * @argument options - The options provided to the modal
     * @argument options.dataValue - The unique identifier of the entities displayed e.g. patient_id
     * @argument options.dataUrl - The GET url for retrieving the data
     */
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

    /**
     * Shows the modal
     */
    FormAPI.modals.openSelectionModal = function () {
        $("#shared-modal").modal("open");
    }

    /**
     * Builds a selector of the selector modal for a given entity - each instance of the entity will call this method
     * @argument header - The name of the value to use for the header of the select e.g. firstname
     * @argument subtext - The subtext of the value to use in the selector e.g. surname
     * @argument dataValue - The unique identifier for this instance of the entity e.g. patient_id
     * @argument data - The data of this entity
     */
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

    /**
     * Caches the data and indicates to the user their selection on the select modal
     */
    FormAPI.modals.select = function () {
        $(".modal-selector").removeClass().addClass("modal-selector card-panel blue");

        // Store the selected id on the modal for easy retrieval
        $(".modal-main").data("id", this.dataset.id);
        this.className = "modal-selector card-panel teal";
    }

    /**
     * Closes and empties the modal
     */
    FormAPI.modals.closeModal = function () {
        $(".modal-main").empty();
        $(".modal-title").empty();

        $("#shared-modal").modal("close");
    }

    FormAPI.data = {};

    /**
     * Populates a Entity on the form
     * @argument data - The date to populate the form with
     * @argument entityName - The name of the entity being
     */
    FormAPI.data.populate = function (data, entityName) {
        var selectedFields = FormAPI.data.getRelatedEntityFields(entityName);

        // Check that there is not a mistake with the data
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
                    relatedImage = $.grep($("img.drawing-image"), function (e) {
                        return e.dataset.field == attribute;
                    });

                if (relatedField && relatedField.length >= 1) {
                    // For all radio buttons tick the one with the value stored
                    if (relatedField[0].type === "radio" && data[attribute] !== null) {
                        $.each(relatedField, function () {
                            if (parseInt(this.value) === data[attribute]) {
                                this.checked = true;
                                return false;
                            }
                        });
                    } else if ($(relatedField[0]).hasClass("datepicker")) {
                        // Datepicker treats the field as text therefore we need to handle it outside the generic field handler
                        $.each(relatedField, function () {
                            var formattedDate = FormAPI.data.filterDate(data[attribute]);

                            this.value = formattedDate;
                        });
                    } else {
                        // If none of the above types of fields populate the field normally
                        $.each(relatedField, function () {
                            FormAPI.data.populateField(this, data[attribute]);
                        });
                    }
                } else if (relatedImage && relatedImage.length === 1) {
                    if (data[attribute]) {
                        // Set the src of the image to what is stored in the drawings folder
                        relatedImage[0].src = "drawings/" + data[attribute];
                    }
                }
            }
        }

        // Update the various form elements
        FormAPI.data.updateEpisodeProgress();
        Materialize.updateTextFields();
    }

    /**
     * Populates a given field based on the type of data it is
     * @argument element - The element on the form being set
     * @argument value - The value to set the element as
     */
    FormAPI.data.populateField = function (element, value) {
        switch (element.type) {
            case "date":
                var dataInput = $("#" + element.id).pickadate(),
                    picker = dataInput.packadate("picker"),
                    formattedDate = moment(value).format("YYYY-MM-DD");

                picker.set("select", FormAPI.data.filterDate(formattedDate), { format: "yyyy-mm-dd" });

                break;
            case "checkbox":
                element.checked = value;
                break;
            default:
                element.value = value;
                break;
        }
    }

    /**
     * Returns an object with all the data for a given entity
     * @argument entityName - The name of the entity to retrieve data for
     */
    FormAPI.data.getDataFromForm = function (entityName) {
        var selectedFields = FormAPI.data.getRelatedEntityFields(entityName),
            entityData = {};

        $.each(selectedFields, function () {
            // Convert the data according to the type of values they are
            if (this.value) {
                if (this.type === "checkbox") {
                    // Convert true/false to 1/0
                    entityData[this.dataset.field] = this.checked ? 1 : 0;
                } else if (this.type === "radio") {
                    // Get the first radio value for the set which is checked
                    entityData[this.dataset.field] = $("input[name=" + this.name + "]:checked").val();
                } else {
                    entityData[this.dataset.field] = this.value;
                }
            }
        });

        return entityData;
    }

    /**
     * Gets all input fields (select, textarea etc.) which are connected to the relevant entity
     * @argument entityName - The name of the entity that the data is retrieved for. 
     * This would be the value in the data-entity on the input field
     */
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

    /**
     * Adds a row in a table
     * @argument elementId - The table which the row is added to
     * @argument data - An array of the data points to add
     */
    FormAPI.data.addTableRow = function (elementId, data) {
        var row = "<tr>";
        $.each(data, function () {
            row += "<td>" + this + "</td>";
        });
        row += "</tr>";

        $("#" + elementId + " > tbody:last-child").append(row);
    }

    /**
     * Clears all of the data on the application e.g. forms/tables etc
     */
    FormAPI.data.clearAll = function () {
        // Each tab is a form so reset all of these
        $.each($("form"), function () {
            this.reset();
        });

        // Images which hold drawings are reset to their original images
        $.each($("img.drawing-image"), function () {
            this.src = this.dataset.originalSrc;
        });

        // Change these for tab dependent unloads
        $("#observations-results").empty();
        //$("#current_medication_table").empty();

        episode = {};

        FormAPI.tabs.clearTabProgress();
        Materialize.updateTextFields();
    }

    /**
     * Filters the date to fit the format of this application
     * @argument dateValue - The value to format
     */
    FormAPI.data.filterDate = function (dateValue) {
        return dateValue.substring(0, 10);
    }

    FormAPI.data.populateData = function (url, uniqueAttributeName, entityName, isMultiple, onLoad) {
        if (url && uniqueAttributeName && entityName) {
            // Default to false if not set
            isMultiple = isMultiple || false;

            $.getJSON(url, function (data) {
                if (data && data.length >= 1) {
                    if (isMultiple) {
                        episode[uniqueAttributeName] = data;
                    } else {
                        episode[uniqueAttributeName] = data[0];
                    }

                    FormAPI.data.populate(data, entityName);

                    if (onLoad && typeof onLoad === "function") {
                        onLoad(data);
                    }
                }
            });
        }
    }

    FormAPI.data.isInputEntityValid = function (entityName) {
        var fields = $("input[data-entity=" + entityName + "]"),
            isEntityValid = true;

        $.each(fields, function () {
            if (!this.validity.valid) {
                var label = $("label[for='" + this.id + "']"),
                    labelName = label && label.length >= 1 ? label[0].text() : this.dataset.field,
                    // Default html5 validation uses the name 'Value', replace this with a friendlier name
                    errorMessage = this.validationMessage.replace("Value", labelName);

                FormAPI.error.showErrorDialog(errorMessage);

                isEntityValid = false;
                return false;
            }
        });

        return isEntityValid;
    }

    /**
     * Updates the progress of the episode visually to the user
     */
    FormAPI.data.updateEpisodeProgress = function () {
        FormAPI.tabs.updateCompletion();
        FormAPI.actionBar.updateSubmitButton();
    }

    FormAPI.tabs = {};

    /**
     * The name of the tag that the User is currently on
     * Defaults to patient as that is the first tab loaded
     */
    FormAPI.tabs.currentTab = "patient";

    /**
     * Checks if all the required completed attributes are set on a tab 
     */
    FormAPI.tabs.checkComplete = function (tab) {
        if (!tab) {
            tab = FormAPI.tabs.getCurrentTab();
        }

        if (tab && tab.completedAttributes) {
            var completedSection = true;
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

    /**
     * Updates the progress of the tabs to show which are in progress and which are completed
     */
    FormAPI.tabs.updateCompletion = function () {
        // Iterate through the different tabs and check their required completed attributes
        $.each(TABS, function () {
            if (FormAPI.tabs.checkComplete(this)) {
                $("#" + this.name + "-tab")
                    .removeClass("tab-in-progress")
                    .addClass("tab-completed");
            } else if (this.completedAttributes) {
                var valuesSet = false;

                // If any of the completed attributes are done then set the tab to in progress
                $.each(this.completedAttributes, function () {
                    if (episode[this]) {
                        valuesSet = true;
                        return false;
                    }
                });

                if (valuesSet) {
                    $("#" + this.name + "-tab").addClass("tab-in-progress");
                }
            }
        });
    }

    /**
     * Attempts to find the tab that is currently displayed to the User
     */
    FormAPI.tabs.getCurrentTab = function () {
        // Get all tabs with the same as the cached tab name
        var tabs = $.grep(TABS, function (e) {
            return e.name === FormAPI.tabs.currentTab;
        });

        if (tabs && tabs.length === 1) {
            return tabs[0];
        }

        return null;
    }


    /**
     * Event Handler to change the tab on click on said tab
     */
    FormAPI.tabs.changeTab = function () {
        var tab = null,
            tabClicked = this;

        // Iterates through the tabs until it finds the one being clicked on
        for (var i = 0; i < TABS.length; i++) {
            // dataset.html contains the name of the tab
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
                        // Timeout to ensure that jquery has time to update the HTML
                        setTimeout(tab.onload, 100);
                        TABS[tab.index].loaded = true;
                    }
                });
            }

            FormAPI.tabs.currentTab = tab.name;
        } else {
            // If this is called, the tabs variable has an error in it
            console.error("Tab is not set.");
        }
    }

    /**
     * Removes all progress indication on the tabs
     */
    FormAPI.tabs.clearTabProgress = function () {
        $(".tab")
            .removeClass("tab-in-progress")
            .removeClass("tab-completed");
    }

    FormAPI.actionBar = {};

    /**
     * Updates the patients name in the action bar
     * @argument patientName - The value to display
     */
    FormAPI.actionBar.updatePatient = function (patientName) {
        if ($("footer").hasClass("hidden")) {
            $("footer").removeClass("hidden");
        }
        $("footer #footer-patient-name").html(patientName);
    }

    FormAPI.actionBar.clear = function () {
        $("footer #footer-patient-name").html("");
        $("footer #footer-episode-info").html("");
        $("footer #footer-action-submit").prop("disabled", true);
        $("footer").addClass("hidden");
    }

    /**
     * Updates the episode data in the action bar
     * @argument episodeData - The value to display
     */
    FormAPI.actionBar.updateEpisode = function (episodeData) {
        $("footer #footer-episode-info").html(episodeData);
    }

    /**
     * Checks that all of the requirements for completing a clinical episode are fulfilled
     */
    FormAPI.actionBar.updateSubmitButton = function () {
        if (episode.episode_id && episode.patient_id && episode.gp_id
            && episode.history_id && episode.observations && episode.examination_id
            && episode.treatment_id && episode.blood_results_id && episode.urine_results_id
            && episode.imaging_results_id && episode.problem_list_id) {
            $("#footer-action-submit").prop("disabled", false);
        }
    }

    FormAPI.handwriting = {};

    /**
     * Cached field so as to know what input field needs to be updated
     */
    FormAPI.handwriting.currentInputField;

    /**
     * Sets up the textareas with handwriting capabilities
     */
    FormAPI.handwriting.setupHandwritingButtons = function () {
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

    /**
     * Opens the full screen handwriting frame
     * @argument inputFieldId - The text field that the handwriting value will fill
     */
    FormAPI.handwriting.openHandwritingFrame = function (inputFieldId) {
        if (!FormAPI.handwriting.currentInputField) {
            $("#handwriting-frame").removeClass("hidden");
            $("main").addClass("hidden");

            FormAPI.handwriting.currentInputField = inputFieldId;
        }
    }

    /**
     * Handles the value returned by the handwriting frame
     * @argument val - The values returned
     */
    FormAPI.handwriting.recieveHandwritingValue = function (val) {
        if (FormAPI.handwriting.currentInputField) {
            $("#" + FormAPI.handwriting.currentInputField).val(val);
            Materialize.updateTextFields();
            FormAPI.handwriting.closeHandwritingFrame();
        }
    }

    /**
     * Closes the handwriting frame
     */
    FormAPI.handwriting.closeHandwritingFrame = function () {
        $("#handwriting-frame").addClass("hidden");
        $("main").removeClass("hidden");

        FormAPI.handwriting.currentInputField = null;
    }

    FormAPI.drawing = {};

    /**
     * Opens a full screen frame of which is used to allow the user to draw on an image
     * @argument element - The image that was clicked on which is used to draw on
     */
    FormAPI.drawing.openDrawingFrame = function (element) {
        // Click encapsulates the element with the currentTarget of the event
        var clickedElement = element.currentTarget,
            fileUrl = location.origin + "/drawing";

        // drawingFrame is a global variable from the draw.js file
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

    /**
     * Displays an error to the user
     * @argument errorMessage - The error message to show the User
     * @requires alertify
     */
    FormAPI.error.showErrorDialog = function (errorMessage) {
        alertify.error(errorMessage);
    }

    // Setup event handlers for general form, do not put event handlers which exist in tabs here, those go in tab on loads

    $(".tab a").click(FormAPI.tabs.changeTab);
    $("#footer-action-submit").click(completeEpisode);

    // Asynchronously load all of the tabs HTML
    $.each(TABS, function (i, e) {
        var tab = e;
        getFormHtml(tab.url).done(function (data) {
            $("#" + tab.name + "-form").append(data);
            tab.onload();
            FormAPI.handwriting.setupHandwritingButtons();
            TABS[i].loaded = true;
        });
    });

    // Check to see if there is a cached patient
    checkCachedEpisode();
});