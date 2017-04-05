var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    routes = require("./routes");

var app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", routes);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});

app.get("/handwriting", function (req, res) {
    res.sendFile(__dirname + "/public/views/handwriting.html");
});

app.get("/episode/:episodeId", function(req, res){
    res.sendFile(__dirname + "/public/views/view.html");
});

var server = app.listen(8000, "0.0.0.0", function () {
    console.log("Listening to port: 8000");
});

module.exports = server;