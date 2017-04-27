var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.filteredList({
        tableName: "imaging_results",
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

routes.get("/:imagingResultId", function (req, res) {
    var imagingResultId = req.params.imagingResultId;

    db.getById({
        tableName: "imaging_results",
        attributeName: "imaging_results_id",
        id: imagingResultId,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

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
