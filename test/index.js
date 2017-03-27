var chai = require("chai"),
    chaiHttp = require("chai-http"),
    server = require("../index.js"),
    should = chai.should();

chai.use(chaiHttp);

describe("/", function () {
    it("it should return some value", function (done) {
        chai.request("http://localhost:8000")
            .get("/test")
            .end(function (err, res) {
                //err.to.be.null;
                res.should.have.status(200);
                done();
            });
    });
});