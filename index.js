var express = require("express"),
    mysql = require("mysql"),
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

app.listen(8000, "0.0.0.0", function () {
    console.log("Listening to port: 8000");
});