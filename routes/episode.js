var routes = require("express").Router({ mergeParams: true }),
    urineresults = require("./urineresults.js"),
    observations = require("./observations.js"),
    examinations = require("./examinations.js"),
    history = require("./history.js"),
    bloodresults = require("./bloodresults.js"),
    imagingresults = require("./imagingresults.js"),
    problemlist = require("./problemlist.js"),
    currentmedication = require("./currentmedication.js"),
    drugTreatment = require("./drugtreatment.js"),
    treatment = require("./treatment.js"),
    db = require("../database.js"),
    models = require("../models");

routes.get("/", function (req, res) {
    var patientId = req.params.patientId;

    db.query("SELECT * FROM clinical_episode WHERE patient_id = ?", [patientId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:episodeId", function (req, res) {
    var patientId = req.params.patientId,
        episodeId = req.params.episodeId;

    db.query("SELECT * FROM clinical_episode WHERE patient_id = ? AND episode_id = ?", [patientId, episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/latest", function (req, res) {
    var patientId = req.params.patientId;

    db.query("SELECT * FROM clinical_episode WHERE patient_id = ? AND completed = 0 ORDER BY date DESC LIMIT 1", [patientId],
        function (err, results) {
            if (err) throw err;

            res.json(results);
        });
});

routes.post("/", function (req, res) {
    var patientId = req.params.patientId,
        episode = req.body;

    episode.patient_id = patientId;

    models.validate("clinical_episode", episode, function (error) {
        res.status(400).send(error);
    },
        function (object) {
            db.query("INSERT INTO clinical_episode SET ?", object, function (err, result) {
                if (err) {
                    res.status(400).send(err.message);
                } else {
                    res.json({ episode_id: result.insertId });
                }
            });
        });
});

routes.post("/:episodeId/complete", function (req, res) {
    var episodeId = req.params.episodeId;

    db.query("UPDATE clinical_episode SET completed = 1 WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) {
            res.status(400).send("Failed to update the episode");
        } else {
            res.send("Done!");
        }
    });
});

routes.use("/:episodeId/observations", observations);
routes.use("/:episodeId/examinations", examinations);
routes.use("/:episodeId/history", history);
routes.use("/:episodeId/bloodresults", bloodresults);
routes.use("/:episodeId/urineresults", urineresults);
routes.use("/:episodeId/imagingresults", imagingresults);
routes.use("/:episodeId/problemlist", problemlist);
routes.use("/:episodeId/currentmedication", currentmedication);
routes.use("/:episodeId/drugtreatment", drugTreatment);
routes.use("/:episodeId/treatment", treatment);

module.exports = routes;
