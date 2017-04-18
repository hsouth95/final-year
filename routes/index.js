var routes = require("express").Router(),
    views = require("./views"),
    patients = require("./patient.js"),
    hospitals = require("./hospitals.js"),
    medications = require("./medication.js"),
    gp = require("./gp.js"),
    diagnosis = require("./diagnosis.js"),
    models = require("../models"),
    path = require("path"),
    fs = require("fs");

var appDir = path.dirname(require.main.filename);

module.exports = function (app, passport) {
    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/public/views/index.html");
    });

    app.get("/home", isLoggedIn, function (req, res) {
        res.sendFile(appDir + "/public/views/home.html");
    });

    app.get("/continueepisode", isLoggedIn, function (req, res) {
        res.sendFile(appDir + "/public/views/continueepisode.html");
    });

    app.get("/handwriting", function (req, res) {
        res.sendFile(appDir + "/public/views/handwriting.html");
    });

    app.get("/viewresult", isLoggedIn, function (req, res) {
        res.sendFile(appDir + "/public/views/view.html");
    });

    app.get("/viewsummary", isLoggedIn, function (req, res) {
        res.sendFile(appDir + "/public/views/viewsummary.html");
    });

    app.use("/view", views);
    app.use("/hospitals", hospitals);
    app.use("/medication", medications);
    app.use("/patients", patients);
    app.use("/gp", gp);
    app.use("/diagnosis", diagnosis);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();

        res.redirect("/");
    }
}