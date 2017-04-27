var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;

    db.customQuery({
        query: "SELECT * FROM drug_treatment dt INNER JOIN medication m ON m.medication_id = dt.medication_id WHERE dt.episode_id = ?",
        data: [episodeId],
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.post("/", function (req, res) {
    var drugtreatment = req.body,
        episodeId = req.params.episodeId;
        drugtreatment.episode_id = episodeId;

    db.add({
        tableName: "drug_treatment",
        data: drugtreatment,
        error: function (err) {
            res.status(400).send(err);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

module.exports = routes;
