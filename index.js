var express = require("express"),
    mysql = require("mysql");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rbch"
});

var app = express();

connection.connect(function(err){
    if(!err){
        console.log("Connected!");
    } else {
        console.log("Error " + err);
    }
});

app.get("/", function(req, res){
    connection.query("SELECT * FROM hospital", function(err, rows, fields){
        if(!err){
            res.json(rows);
        } else {
            console.log("Error with query");
        }
    });
});

app.listen(3000);