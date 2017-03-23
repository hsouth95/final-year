var routes = require("express").Router({ mergeParams: true }),
    db = require("../../../../../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM treatment WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:treatmentId", function (req, res) {
    var treatmentId = req.params.treatmentId;
    db.query("SELECT * FROM treatment WHERE treatment_id = ?", [treatmentId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
