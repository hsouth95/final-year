var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

// routes.get("/", function (req, res) {
//     var episodeId = req.params.episodeId;
//     db.query("SELECT * FROM imaging_results WHERE episode_id = ?", [episodeId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });

// routes.get("/:imagingResultId", function (req, res) {
//     var imagingResultId = req.params.imagingResultId;
//     db.query("SELECT * FROM urine_results WHERE imaging_results_id = ?", [imagingResultId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        imagingResults = req.body;
    imagingResults.episode_id = episodeId;

    db.add({
        tableName: "imaging_results",
        data: imagingResults,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (imaging_results_id) {
            res.json({ imaging_results_id: imaging_results_id });
        }
    });
});


module.exports = routes;
