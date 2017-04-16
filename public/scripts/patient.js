var scripts = scripts || {};

scripts.patient = scripts.patient || {};

location.origin = location.origin || location.protocol + "//" + location.host;

scripts.patient.name = "patient";

scripts.patient.url = location.origin + "/view/patient";

scripts.patient.completedAttributes = [
    "hospital_id",
    "patient_id",
    "gp_id"
];

scripts.patient.onload = function () {

}

scripts.patient.populateHospitals = function () {
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
}