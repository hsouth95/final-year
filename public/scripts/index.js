$(document).ready(function () {
    $('select').material_select();

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 200
    });


    $("#add-patient").click(function(event){
        event.preventDefault();

        var patientData = {},
            address = {};
        
        patientData.patientId = "PATIENT";
        patientData.surname = $("#patient_surname").val();
        patientData.firstname = $("#patient_firstname").val();
        patientData.dateofbirth = $("#patient_dateofbirth").val();
        patientData.gender = $("#patient_gender").val();
        patientData.telephone = $("#patient_telephone").val();
        
        address.firstline = $("#address_firstline").val();
        address.secondline = $("#address_secondline").val();
        address.city = $("#address_city").val();
        address.county = $("#address_county").val();
        address.postcode = $("#address_postcode").val();

        patientData.address = address;

        $.ajax({
            url: "http://localhost:3000/patient",
            data: JSON.stringify(patientData),
            type: "POST",
            contentType: "application/json",
            success: function(data) {
                console.log(data);
            },
            error: function(data){
                console.log(JSON.stringify(data));
            }
        })
    });
});