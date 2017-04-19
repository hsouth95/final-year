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

app.use(session({ secret: "jz6lFRgb6q96liqI8vjtVWn1d0jI80Ej" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./routes")(app, passport);

app.post("/login", passport.authenticate("local-login", {
    successRedirect: "/home",
    failureRedirect: "/?error=Failed_to_log_in"
}));

app.post("/createaccount", passport.authenticate("local-signup", {
    successRedirect: "/",
    failureRedirect: "/"
}));

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

var server = app.listen(8000, "0.0.0.0", function () {
    console.log("Listening to port: 8000");
});

module.exports = server;