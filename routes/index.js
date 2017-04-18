var routes = require("express").Router(),
    views = require("./views"),
    patients = require("./patient.js"),
    hospitals = require("./hospitals.js"),
    medications = require("./medication.js"),
    gp = require("./gp.js"),
    diagnosis = require("./diagnosis.js"),
    models = require("../models");

module.exports = function (app, passport) {
    app.get("/home", isLoggedIn, function (req, res) {
        res.sendFile("E:/Code/final-year/public/views/home.html");
    });

    routes.use("/view", views);
    routes.use("/hospitals", hospitals);
    routes.use("/medication", medications);
    routes.use("/patients", patients);
    routes.use("/gp", gp);
    routes.use("/diagnosis", diagnosis);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();

        res.redirect("/");
    }
}