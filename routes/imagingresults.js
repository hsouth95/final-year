var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM imaging_results WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:imagingResultId", function (req, res) {
    var imagingResultId = req.params.imagingResultId;
    db.query("SELECT * FROM urine_results WHERE imaging_results_id = ?", [imagingResultId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
