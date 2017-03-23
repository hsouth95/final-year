var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM drug_treatment dt INNER JOIN medication m ON m.medication_id = dt.medication_id WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
