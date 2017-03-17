var routes = require("express").Router(),
    db = require("../../../database.js");

routes.get("/", function (req, res) {
    db.query("SELECT * FROM diagnosis", function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;