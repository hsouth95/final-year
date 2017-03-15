var routes = require("express").Router(),
    patients = require("./patients"),
    hospitals = require("./hospitals"),
    medications = require("./medication"),
    gp = require("./gp");

routes.use("/hospitals", hospitals);
routes.use("/medication", medications);
routes.use("/patients", patients);
routes.use("/gp", gp);

module.exports = routes;