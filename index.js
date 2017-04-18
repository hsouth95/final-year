var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    routes = require("./routes"),
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    flash = require("connect-flash"),
    passport = require("passport");

var app = express();

app.use(morgan("dev"));
app.use(cookieParser());

require("./authenticate/init.js")(passport);

app.use(session({ secret: "apple" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./routes")(app, passport);

app.get("/continueepisode", function (req, res) {
    res.sendFile(__dirname + "/public/views/continueepisode.html");
});

app.get("/handwriting", function (req, res) {
    res.sendFile(__dirname + "/public/views/handwriting.html");
});

app.get("/viewresult", function (req, res) {
    res.sendFile(__dirname + "/public/views/view.html");
});

app.get("/viewsummary", function (req, res) {
    res.sendFile(__dirname + "/public/views/viewsummary.html");
});

app.post("/login", passport.authenticate("local-login", {
    successRedirect: "/home",
    failureRedirect: "/viewsummary"
}));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});

var server = app.listen(8000, "0.0.0.0", function () {
    console.log("Listening to port: 8000");
});

module.exports = server;