var routes = require("express").Router({ mergeParams: true }),
    db = require("../../../../../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM problem_list WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:problemListId", function (req, res) {
    var problemListId = req.params.problemListId;
    db.query("SELECT * FROM problem_list WHERE problem_list_id = ?", [problemListId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

module.exports = routes;
