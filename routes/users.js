var routes = require("express").Router(),
    db = require("../database2");

routes.get("/:userId", function (req, res) {
    var userId = req.params.userId;
    db.customQuery({
        query: "SELECT firstname, surname FROM users WHERE user_id = ?",
        data: [userId],
        error: function(err){
            res.status(400).send(err.message);
        },
        success: function(data){
            res.json(data);
        }
    });
});

module.exports = routes;