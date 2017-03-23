var routes = require("express").Router(),
    db = require("../database.js");


// Uses query parameters
routes.get("/", function (req, res) {
    var query = "SELECT * FROM gp",
        firstName = req.query.firstname,
        surname = req.query.surname;

    if (firstName) {
        query += " WHERE firstname = " + db.escape(firstName);
    }

    if (surname) {
        if (firstName) {
            query += " AND ";
        } else {
            query += " WHERE ";
        }
        query += " surname = " + db.escape(surname);
    }

    db.query(query, function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});


module.exports = routes;