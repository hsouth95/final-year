var routes = require("express").Router(),
    db = require("../database.js"),
    episode = require("./episode.js");

routes.use("/:patientId/episodes", episode);

routes.get("/:patientId", function (req, res) {
    var patientId = req.params.patientId;
    db.query("SELECT * FROM patient WHERE patient_id = ? LIMIT 1", [patientId], function (err, results) {
        if (err) throw err;

        var patient = results[0],
            data = {};
        data.address = {};

        for (var attribute in patient) {
            if (patient.hasOwnProperty(attribute)) {
                if (attribute.indexOf("address") !== -1) {
                    data.address[attribute] = patient[attribute];
                } else {
                    data[attribute] = patient[attribute];
                }
            }
        }

        res.json(data);
    });
});

routes.post("/", function (req, res) {
    var patient = req.body;

    db.query("INSERT INTO patient (patient_id, surname, firstname, address_line_1, address_line_2, address_city, address_county, address_postcode) "
        + "VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [patient.patientId, patient.surname, patient.firstname, patient.address.firstline, patient.address.secondline, patient.address.city,
        patient.address.city, patient.address.county, patient.address.postcode], function (err, results) {
            if (err) throw err;

            res.json(results.insertId);
        });
});


module.exports = routes;