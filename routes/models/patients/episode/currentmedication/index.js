var routes = require("express").Router({ mergeParams: true }),
    db = require("../../../../../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM current_medication cm INNER JOIN medication m ON m.medication_id = cm.medication_id WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
