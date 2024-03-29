var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2"),
    moment = require("moment"),
    models = require("../models");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.customQuery({
        query: "SELECT * FROM episode_observations eo INNER JOIN observations o ON eo.observation_id = o.observation_id WHERE episode_id = ?",
        data: [episodeId],
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.get("/:observationId", function (req, res) {
    var observationId = req.params.observationId;
    db.getById({
        tableName: "observations",
        attributeName: "observation_id",
        id: observationId,
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
        observation = req.body;

    observation.user_id = req.user.user_id;

    observation.date = moment().format("YYYY-MM-DD").toString();
    observation.time = moment().format("kk:mm:ss").toString();

    models.validate("observations", observation, function (err) {
        res.status(400).send(err);
    },
        function (object) {
            db.beginTrans(console.log, function () {
                // Add observation values
                db.add({
                    tableName: "observations",
                    data: object,
                    error: function (err) {
                        res.status(400).send(err.message);
                    },
                    success: function (observation_id) {
                        // Add look up table
                        db.add({
                            tableName: "episode_observations",
                            data: { episode_id: episodeId, observation_id: observation_id },
                            error: function (err) {
                                res.status(400).send(err.message);
                            },
                            success: function () {
                                db.endTrans(console.log, function () {
                                    res.json({ observation_id: observation_id });
                                });
                            }
                        });
                    }
                });
            });
        });
});

routes.post("/lungs", function (req, res) {
    var image = req.body.lungs,
        episodeId = req.params.episodeId,
        fileName = "lungs-" + episodeId + ".jpg";

    fs.writeFile(fileName, image.split(",")[1], { encoding: 'base64' });

    res.json({ fileName: fileName });
});

module.exports = routes;
