var routes = require("express").Router(),
    db = require("../database2"),
    episode = require("./episode.js");


routes.get("/:patientId", function (req, res) {
    var patientId = req.params.patientId;
    db.getById({
        tableName: "patient",
        attributeName: "patient_id",
        id: patientId,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

routes.use("/:patientId/episodes", episode);

module.exports = routes;