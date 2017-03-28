var chai = require("chai"),
    chaiHttp = require("chai-http"),
    mockery = require("mockery"),
    expressRouteFake = require("express-route-fake"),
    sinon = require("sinon"),
    should = chai.should(),
    assert = chai.assert;

chai.use(chaiHttp);

describe("/", function () {
    var server,
        database;
    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        database = {
        }

        mockery.registerMock("../database2", database);
        server = require("../index.js");
    });

    afterEach(function () {
        mockery.disable();
    });

    it("it should return some value", function (done) {
        database.list = sinon.stub();
        chai.request(server)
            .get("/patients/1/episodes/1/observations/1/test")
            .end(function (err, res) {
                assert(database.list.calledOnce);
                done();
            });
    });
});

describe("/patients/x/episodes/x/observations/test", function () {
    it("it should call db list", function (done) {

    })
});