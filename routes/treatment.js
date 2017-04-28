var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;

    db.filteredList({
        tableName: "treatment",
        filteredField: "episode_id",
        filteredValue: episodeId,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.get("/:treatmentId", function (req, res) {
    var treatmentId = req.params.treatmentId;
    db.getById({
        tableName: "treatment",
        attributeName: "treatment_id",
        id: treatmentId,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.post("/", function (req, res) {
    var treatment = req.body,
        episodeId = req.params.episodeId;
    treatment.episode_id = episodeId;
    treatment.user_id = req.user.user_id;

    db.add({
        tableName: "treatment",
        data: treatment,
        error: function (err) {
            res.status(400).send(err);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

module.exports = routes;
