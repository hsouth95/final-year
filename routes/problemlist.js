var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

// routes.get("/", function (req, res) {
//     var episodeId = req.params.episodeId;
//     db.query("SELECT * FROM problem_list WHERE episode_id = ?", [episodeId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });

// routes.get("/:problemListId", function (req, res) {
//     var problemListId = req.params.problemListId;
//     db.query("SELECT * FROM problem_list WHERE problem_list_id = ?", [problemListId], function (err, results) {
//         if (err) throw err;

//         res.json(results);
//     });
// });

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        problemlist = req.body;
    problemlist.episode_id = episodeId;

    db.add({
        tableName: "problem_list",
        data: problemlist,
        error: function (err) {
            res.status(400).send(err.message);
        },
        success: function (problem_list_id) {
            res.json({ problem_list_id: problem_list_id });
        }
    });
});

module.exports = routes;
