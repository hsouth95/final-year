var routes = require("express").Router(),
    views = require("./views"),
    patients = require("./patient.js"),
    hospitals = require("./hospitals.js"),
    medications = require("./medication.js"),
    gp = require("./gp.js"),
    diagnosis = require("./diagnosis.js"),
    models = require("../models");

routes.use("/view", views);
routes.use("/hospitals", hospitals);
routes.use("/medication", medications);
routes.use("/patients", patients);
routes.use("/gp", gp);
routes.use("/diagnosis", diagnosis);

routes.post("/validate", function (req, res) {
    models("clinical_episode", req.body,
        function (errorMessage) {
            console.log(errorMessage);
            res.status(500).send(errorMessage);
        },
        function () {
            res.send("Success!");
        });
});

module.exports = routes;