var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2"),
    models = require("../models");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.list({
        tableName: "history",
        error: function (message) {
            res.status(400).send(message);
        },
        success: function (data) {
            res.json(data);
        }
    })
});

routes.get("/:historyId", function (req, res) {
    var historyId = req.params.historyId;
    db.getById({
        tableName: "history",
        attributeName: "history_id",
        id: historyId,
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
        history = req.body;

    models.validate("history", history, function (err) {
        res.status(400).send(err);
    },
        function (object) {
            db.add({
                tableName: "history",
                data: object,
                error: function (err) {
                    res.status(400).send(err.message);
                },
                success: function (history_id) {
                    res.json({ history_id: history_id });
                }
            });
        });
});

module.exports = routes;
