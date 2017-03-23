var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM episode_diagnosis ed INNER JOIN diagnosis d ON d.diagnosis_id = ed.diagnosis_id WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:diagnosisId", function (req, res) {
    var diagnosisId = req.params.diagnosisId;
    db.query("SELECT * FROM diagnosis WHERE diagnosis_id = ?", [diagnosisId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
