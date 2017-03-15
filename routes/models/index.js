var routes = require("express").Router(),
    patients = require("./patients");

routes.use("/patients", patients);

module.exports = routes;