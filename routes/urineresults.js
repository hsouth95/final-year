var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.filteredList({
        tableName: "urine_results",
        filteredField: "episode_id",
        filteredValue: episodeId,
        error: function (err) {
            res.status(400).send(err);
        },
        success: function (data) {
            res.json(data);
        }
    })
});

// routes.get("/:urineResultId", function (req, res) {
//     var urineResultId = req.params.urineResultId;
//     db.query("SELECT * FROM urine_results WHERE urine_results_id = ?", [urineResultId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        urineResults = req.body;
    urineResults.episode_id = episodeId;

    db.add({
        tableName: "urine_results",
        data: urineResults,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (urine_results_id) {
            res.json({ urine_results_id: urine_results_id });
        }
    });
});

module.exports = routes;
