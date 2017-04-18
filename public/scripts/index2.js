$(document).ready(function(){
    // Set the base url
    if (!location.origin) {
        location.origin = location.protocol + "//" + location.host;
    }
    
    $("#log-in").click(function(){
        var data = {};
        
        data.username = $("#username").val();
        data.password = $("#password").val();

        $.post("/login", data, function(){
            window.location.replace(location.origin + "/home");
        });
    });
});