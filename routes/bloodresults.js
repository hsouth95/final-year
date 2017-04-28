var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2"),
    models = require("../models");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.filteredList({
        tableName: "blood_results",
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

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        bloodResults = req.body;
    bloodResults.episode_id = episodeId;
    bloodResults.user_id = req.user.user_id;

    db.add({
        tableName: "blood_results",
        data: bloodResults,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (blood_results_id) {
            res.json({ blood_results_id: blood_results_id });
        }
    });
});

module.exports = routes;
