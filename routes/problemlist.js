var routes = require("express").Router({ mergeParams: true }),
    db = require("../database2");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.filteredList({
        tableName: "problem_list",
        filteredField: "episode_id",
        filteredValue: episodeId,
        error: function (err) {
            res.status(400).send(err);
        },
        success: function (data) {
            res.json(data);
        }
    })
});

routes.post("/", function (req, res) {
    var episodeId = req.params.episodeId,
        problemlist = req.body;
    problemlist.episode_id = episodeId;
    problemlist.user_id = req.user.user_id;

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
