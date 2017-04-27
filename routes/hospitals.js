var routes = require("express").Router(),
    db = require("../database.js");

routes.get("/", function (req, res) {
    db.query("SELECT * FROM hospital", function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:hospitalId", function (req, res) {
    db.getById({
        tableName: "hospital",
        attributeName: "hospital_id",
        id: req.params.hospitalId,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (data) {
            res.json(data);
        }
    });
});

module.exports = routes;