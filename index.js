var express = require("express"),
    mysql = require("mysql"),
    path = require("path");

/*var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rbch"
});*/

var app = express();

app.use(express.static(path.join(__dirname, "public")));

/*connection.connect(function(err){
    if(!err){
        console.log("Connected!");
    } else {
        console.log("Error " + err);
    }
});*/

app.get("/", function(req, res){
    connection.query("SELECT * FROM hospital", function(err, rows, fields){
        if(!err){
            res.json(rows);
        } else {
            console.log("Error with query");
        }
    });
});

app.get("/apple", function(req, res){
    res.sendFile(__dirname + "/public/views/index.html");
});

app.listen(3000);