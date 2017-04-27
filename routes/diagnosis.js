var routes = require("express").Router(),
    db = require("../database2");

routes.get("/", function (req, res) {
    db.list({
        tableName: "diagnosis",
        success: function (data) {
            res.json(data);
        },
        error: function (err) {
            res.status(400).send(err.message);
        }
    });
});

module.exports = routes;