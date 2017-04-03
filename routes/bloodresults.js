var routes = require("express").Router({ mergeParams: true }),
    db = require("../database.js");

routes.get("/", function (req, res) {
    var episodeId = req.params.episodeId;
    db.query("SELECT * FROM blood_results WHERE episode_id = ?", [episodeId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.get("/:bloodResultsId", function (req, res) {
    var bloodResultsId = req.params.bloodResultsId;
    db.query("SELECT * FROM urine_results WHERE blood_results_id = ?", [bloodResultsId], function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

routes.post("/", function(req, res){
    var episodeId = req.params.episodeId;

    
})

module.exports = routes;
