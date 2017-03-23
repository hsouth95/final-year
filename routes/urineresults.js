var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM urine_results WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:urineResultId", function (req, res) {
    var urineResultId = req.params.urineResultId;
    db.query("SELECT * FROM urine_results WHERE urine_results_id = ?", [urineResultId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
