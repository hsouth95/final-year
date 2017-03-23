var fs = require("fs");

var validate = function (data, errorCallback, successCallback) {
    fs.readFile("./models.json", "utf8", function (err, data) {
        if (err) errorCallback(err.message);


    });
}