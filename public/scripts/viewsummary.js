$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    var patientBaseUrl = location.origin + "/patients/"

    $("#find-patient").click(function () {
        $("#episode-collection").empty();

        var patientId = $("#patient_number").val();

        // Check the patient exists
        $.getJSON(patientBaseUrl + patientId, function (data) {
            if (data) {
                // Get all episodes for this patient
                $.getJSON(patientBaseUrl + patientId + "/episodes", function (data) {
                    if (data && data.length >= 1) {

                        $.each(data, function () {
                            if (this.completed) {
                                var value = this.date.substring(0, 10) + " - " + this.reason_referral,
                                    valueContainer = document.createElement("a");

                                valueContainer.className = "collection-item";
                                valueContainer.href = location.origin + "/viewresult?episodeid=" + this.episode_id + "&patientid=" + this.patient_id;
                                valueContainer.innerHTML = value;
                                $("#episode-collection").append(valueContainer);
                            }
                        });
                    } else {
                        $("#episode-collection").html("No completed episodes for this patient.");
                    }
                });
            }
        }).fail(function () {
            alert("cannot find patient");
        });
    });
});