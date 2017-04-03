var routes = require("express").Router(),
    db = require("../database2");

routes.get("/", function (req, res) {
    db.list({
        tableName: "medication",
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

module.exports = routes;