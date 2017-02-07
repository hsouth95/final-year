$(document).ready(function () {
    $("#find_patient").click(function () {

        var patientId = $("#patient_number").val();
        $.ajax({
            url: "http://localhost:3000/patient/" + patientId,
            success: function (data) {
                console.log(data);
                populatePatientInformation(data);
            },
            error: function(){
                $("#patient-container").html("Cannot find patient");
            }
        });
    });



    populatePatientInformation = function (data) {
        var patientBlock = $("#patient-container");

        patientBlock.empty();

        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                var informationNode = document.createElement("span");

                informationNode.className = "information";
                informationNode.id = property;
                informationNode.innerHTML = data[property];

                patientBlock.append(informationNode);
            }
        }
    }
});