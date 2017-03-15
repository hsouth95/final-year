var routes = require("express").Router(),
    path = require("path"),
    fs = require("fs");

var appDir = path.dirname(require.main.filename);

routes.get("/", function(req, res){
    res.send(appDir);
});

routes.get("/:viewName", function (req, res) {
    if (fs.existsSync(appDir + "/public/views/" + req.params.viewName + ".html")) {
        res.sendFile(appDir + "/public/views/" + req.params.viewName + ".html");
    } else {
        res.status(404).send("No view found.");
    }
});

module.exports = routes;