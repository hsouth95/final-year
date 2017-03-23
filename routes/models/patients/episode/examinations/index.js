var routes = require("express").Router({ mergeParams: true }),
    db = require("../../../../../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM examination WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:examinationId", function (req, res) {
    var examinationId = req.params.examinationId;
    db.query("SELECT * FROM examination WHERE examination_id = ?", [examinationId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
