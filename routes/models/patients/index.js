var routes = require("express").Router();

routes.get("/", function(req, res){
    res.json({message: "Ite patient"});
});

module.exports = routes;