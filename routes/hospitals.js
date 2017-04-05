var routes = require("express").Router(),
    db = require("../database.js");

routes.get("/", function (req, res) {
    db.query("SELECT * FROM hospital", function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:hospitalId", function (req, res) {
    db.query("SELECT * FROM hospital WHERE hospital_id = ?", [req.params.hospitalId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;