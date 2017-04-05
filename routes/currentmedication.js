var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

// routes.get("/", function (req, res) {
//     var episodeId = req.params.episodeId;
//     db.query("SELECT * FROM current_medication cm INNER JOIN medication m ON m.medication_id = cm.medication_id WHERE episode_id = ?", [episodeId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });


routes.post("/", function (req, res) {
    var currentmedication = req.body,
        episodeId = req.params.episodeId;
        currentmedication.episode_id = episodeId;

    db.add({
        tableName: "current_medication",
        data: currentmedication,
        error: function (err) {
            res.status(400).send(err);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

module.exports = routes;
