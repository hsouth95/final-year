var express = require("express"),
    mysql = require("mysql"),
    path = require("path"),
    bodyParser = require("body-parser");

var connection = mysql.createConnection({
    connectionLimit: 100,
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rbch"
});

var app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());



app.get("/view", function(req, res){
    res.sendFile(__dirname + "/public/views/view.html");
});

app.get("/patient/:patientId", function(req, response){
    var patientId = req.params.patientId; 
    connection.query("SELECT * FROM patient WHERE patient_id = ? LIMIT 1", [patientId], function(err, res){
        if(err) throw err;

        response.json(res[0]);
    });
});

app.post("/patient", function (req, response) {
    var patient = req.body;

    connection.query("INSERT INTO patient (patient_id, surname, firstname, address_line_1, address_line_2, address_city, address_county, address_postcode) "
        + "VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [patient.patientId, patient.surname, patient.firstname, patient.address.firstline, patient.address.secondline, patient.address.city,
        patient.address.city, patient.address.county, patient.address.postcode], function (err, res) {
            if(err) throw err;

            response.json(res.insertId);
        });
});


app.get("/hospital", function(req, response) {
    connection.query("SELECT * FROM hospital", function(err, res){
        if(err) throw err;

        response.json(res);
    });
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});

app.listen(80, "0.0.0.0", function(){
    console.log("Listening to port: 80");
});