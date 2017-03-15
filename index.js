var express = require("express"),
    mysql = require("mysql"),
    path = require("path"),
    bodyParser = require("body-parser"),
    fs = require("fs"),
    routes = require("./routes");

var connection = mysql.createConnection({
    connectionLimit: 100,
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rbch"
});

var app = express(),
    mainDirectory = __dirname;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use("/", routes);

app.get("/view", function (req, res) {
    res.sendFile(__dirname + "/public/views/view.html");
});

app.get("/patient/:patientId", function (req, response) {
    var patientId = req.params.patientId;
    connection.query("SELECT * FROM patient WHERE patient_id = ? LIMIT 1", [patientId], function (err, res) {
        if (err) throw err;

        var patient = res[0],
            data = {};
        data.address = {};

        for (var attribute in patient) {
            if (patient.hasOwnProperty(attribute)) {
                if (attribute.indexOf("address") !== -1) {
                    data.address[attribute] = patient[attribute];
                } else {
                    data[attribute] = patient[attribute];
                }
            }
        }

        response.json(data);
    });
});
app.get("/patient/:patientId/latestepisodeid", function (req, res) {
    var patientId = req.params.patientId;

    connection.query("SELECT episode_id FROM clinical_episode WHERE patient_id = ?", [patientId], function (err, results) {
        if (err) throw console.log(err);

        res.json(results);
    });
});

app.post("/patient", function (req, res) {
    var patient = req.body;

    connection.query("INSERT INTO patient (patient_id, surname, firstname, address_line_1, address_line_2, address_city, address_county, address_postcode) "
        + "VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [patient.patientId, patient.surname, patient.firstname, patient.address.firstline, patient.address.secondline, patient.address.city,
        patient.address.city, patient.address.county, patient.address.postcode], function (err, results) {
            if (err) throw err;

            res.json(results.insertId);
        });
});


app.get("/medication", function (req, res) {
    connection.query("SELECT * FROM medication", function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

app.get("/hospital", function (req, res) {
    connection.query("SELECT * FROM hospital", function (err, results) {
        if (err) throw err;

        res.json(results);
    });
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});

app.listen(8000, "0.0.0.0", function () {
    console.log("Listening to port: 8000");
});