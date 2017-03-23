var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM episode_observations eo INNER JOIN " +
        "observations o ON eo.observation_id = o.observation_id WHERE episode_id = ?",
        [episodeId], function (err, results) {
            if (err) throw err;

            res.json(results);
        });
});

routes.get("/:observationId", function (req, res) {
    var observationId = req.params.observationId;
    db.query("SELECT * FROM observations WHERE observation_id = ?", [observationId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
