var routes = require("express").Router({ mergeParams: true }),
    models = require("../models"),
    db = require("../database2"),
    fs = require("fs");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.customQuery({
        query: "SELECT * FROM examination WHERE episode_id = ?",
        data: [episodeId],
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.get("/:examinationId", function (req, res) {
    var examinationId = req.params.examinationId;

    db.getById({
        tableName: "examination",
        attributeName: "examination_id",
        id: examinationId,
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
        examination = req.body;

    examination.episode_id = episodeId;

    models.validate("examination", examination, function (err) {
        res.status(400).send(err);
    },
        function (object) {
            db.add({
                tableName: "examination",
                data: object,
                error: function (err) {
                    res.status(400).send(err.message);
                },
                success: function (examination_id) {
                    res.json({ examination_id: examination_id });
                }
            });
        });
});

routes.post("/drawing", function (req, res) {
    var image = req.body.drawing,
        drawingName = req.body.drawingName,
        episodeId = req.params.episodeId,
        fileName = "lungs-" + episodeId + ".jpg";

    fs.writeFile(fileName, image.split(",")[1], { encoding: 'base64' });

    res.json({ fileName: fileName });
});

module.exports = routes;
