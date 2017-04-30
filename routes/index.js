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
        if (req.isAuthenticated()) {
            res.redirect("/home");
        } else {
            res.sendFile(appDir + "/public/views/index.html");
        }
    });
    app.get("/create", isLoggedIn, function (req, res) {
        res.sendFile(appDir + "/public/views/createaccount.html");
    });

    app.post("/drawing", isLoggedIn, function (req, res) {
        var image = req.body.drawing,
            fileName = req.body.fileName;

        fileName = appDir + "/public/drawings/" + fileName;

        if (image && fileName) {
            fs.writeFile(fileName, image.split(",")[1], { encoding: 'base64' });

            res.json({ fileName: req.body.fileName });
        } else {
            res.status(400).send("Image or file name not provided.");
        }
    });

    app.post("/abnormal", isLoggedIn, function (req, res) {
        var data = req.body,
            entityName = req.query.entity;

        if (entityName && data) {
            models.getAbnormalValues(entityName, data, function (abnormalResults) {
                res.json(abnormalResults);
            }, function (message) {
                res.status(500).send("No entity range for that entity");
            });
        } else {
            res.status(400).send("Entity name or data is not provided");
        }
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
    app.get("/drawing", function (req, res) {
        res.sendFile(appDir + "/public/views/drawing.html");
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