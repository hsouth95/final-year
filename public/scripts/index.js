$(document).ready(function () {
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }

    $("#log-in").click(function () {
        var data = {};

        data.username = $("#username").val();
        data.password = $("#password").val();

        $.post("/login", data, function () {
            window.location.replace(location.origin + "/home");
        });
    });


    displayError = function () {
        var error = getParameterByName("error");
        if (error) {
            // Can't have spaces in url so replace underscores
            error = error.replace(/_/g, " ");
            $("#error").html(error);
            $("#error").show();
        }
    }

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


    displayError();
});