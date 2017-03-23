var routes = require("express").Router({ mergeParams: true }),
    urineresults = require("./urineresults.js"),
    db = require("../database.js");

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

    db.query("SELECT * FROM clinical_episode WHERE patient_id = ? ORDER BY date DESC LIMIT 1", [patientId],
        function (err, results) {
            if (err) throw err;

            res.json(results);
        });
});

routes.post("/", function (req, res) {
    var patientId = req.params.patientId,
        episode = req.body;
    
    episode.patient_id = patientId;

    db.query("INSERT INTO clinical_episode SET ?", episode, function(err, result) {
        req.json(result.insertId);
    });
});

routes.use("/:episodeId/urineresults", urineresults);

module.exports = routes;
