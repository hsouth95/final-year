var routes = require("express").Router(),
    patients = require("./patients"),
    hospitals = require("./hospitals"),
    medications = require("./medication"),
    gp = require("./gp"),
    diagnosis = require("./diagnosis");

routes.use("/hospitals", hospitals);
routes.use("/medication", medications);
routes.use("/patients", patients);
routes.use("/gp", gp);
routes.use("/diagnosis", diagnosis);

module.exports = routes;