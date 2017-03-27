var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js"),
    models = require("../models");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM episode_observations eo INNER JOIN " +
        "observations o ON eo.observation_id = o.observation_id WHERE episode_id = ?",
        [episodeId], function (err, results) {
            if (err) throw err;

            res.json(results);
        });
});

routes.get("/:observationId", function (req, res) {
    var observationId = req.params.observationId;
    db.query("SELECT * FROM observations WHERE observation_id = ?", [observationId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        observation = req.body;

    models.validate("observations", observation, function (err) {
        res.status(400).send(err);
    },
        function (object) {
            db.getConnection(function (err, connection) {
                connection.beginTransaction(function (err) {
                    if (err) { throw err; }

                    connection.query("INSERT INTO observations SET ?", object, function (err, obsResults) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }

                        connection.query("INSERT INTO episode_observations (episode_id, observation_id) VALUES (?, ?)", [episodeId, obsResults.insertId], function (err, conResult) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }

                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        throw err;
                                    });
                                }

                                res.status(200).json({ observation_id: obsResults.insertId });
                            })
                        })
                    })
                })
            });
        });
});

module.exports = routes;
