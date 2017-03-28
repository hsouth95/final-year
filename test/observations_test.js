var chai = require("chai"),
    chaiHttp = require("chai-http"),
    mockery = require("mockery"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    should = chai.should(),
    expect = chai.expect;

chai.use(chaiHttp);
chai.use(sinonChai);

describe("get observations by id", function () {
    var server,
        database,
        url = "/patients/1/episodes/1/observations/1";

    // Mock the database behind these routes
    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        database = {
        }

        mockery.registerMock("../database2", database);
        server = require("../index.js");
    });

    afterEach(function () {
        mockery.disable();
        server.close();
    });

    it("should return a valid observation", function (done) {
        database.getById = sinon.stub().callsFake(function (obj) {
            obj.success({ observation_id: 1 });
        });

        chai.request(server)
            .get(url)
            .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.key("observation_id");
                done();
            });
    });

    it("should return an error on a invalid observation", function (done) {
        database.getById = sinon.stub().callsFake(function (obj) {
            obj.error({ message: "test" });
        });

        chai.request(server)
            .get(url)
            .end(function (err, res) {
                res.should.have.status(400);
                should.not.equal(err, null);
                done();
            });
    });

    it("should be called with valid arguements", function (done) {
        database.getById = sinon.stub().callsFake(function (obj) {
            obj.success({ observation_id: 1 });
        });

        chai.request(server)
            .get(url)
            .end(function (err, res) {
                expect(database.getById).to.have.been.calledWithMatch(sinon.match({
                    tableName: "observations",
                    attributeName: "observation_id",
                    id: "1"
                }));
                done();
            });
    });
});

describe("creating an observation", function () {
    var server,
        database,
        models,
        url = "/patients/1/episodes/1/observations";

    // Mock the database behind these routes
    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        database = {
        }
        models = {
        }


        mockery.registerMock("../database2", database);
        server = require("../index.js");
    });

    afterEach(function () {
        mockery.disable();
        server.close();
    });

    it("should create an observation successfully", function (done) {
        database.beginTrans = sinon.stub().callsFake(function (arg1, success) {
            success();
        });
        database.add = sinon.stub().callsFake(function (options) {
            if (options.tableName === "observations") {
                options.success(1);
            } else {
                options.success();
            }
        });
        database.endTrans = sinon.stub().callsFake(function (arg1, success) {
            success();
        });

        chai.request(server)
            .post(url)
            .send({ pulse: "45", temperature: "45" })
            .end(function (err, res) {
                expect(database.beginTrans).to.have.been.calledOnce;
                expect(database.beginTrans).to.have.been.calledBefore(database.add);
                expect(database.add).to.have.been.calledTwice;
                expect(database.endTrans).to.have.been.calledOnce;
                expect(database.endTrans).to.have.been.calledAfter(database.add);

                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have.key("observation_id");
                expect(res.body.observation_id).to.equal(1);

                done();
            });
    });

    it("should respond with an error on observations creation", function (done) {
        database.beginTrans = sinon.stub().callsFake(function (arg1, success) {
            success();
        });
        database.add = sinon.stub().callsFake(function (obj) {
            obj.error("test");
        });

        chai.request(server)
            .post(url)
            .send({ pulse: "45", temperature: "45" })
            .end(function (err, res) {
                expect(database.beginTrans).to.have.been.calledOnce;
                expect(database.beginTrans).to.have.been.calledBefore(database.add);
                expect(database.add).to.have.been.calledOnce;

                res.should.have.status(400);
                done();
            });
    });

    it("should respond with an error on episode_observations creation", function(done){
        database.beginTrans = sinon.stub().callsFake(function (arg1, success) {
            success();
        });
        database.add = sinon.stub().callsFake(function (obj) {
            if (obj.tableName === "observations") {
                obj.success(1);
            } else {
                obj.error("test");
            }
        });
        database.endTrans = sinon.stub();

        chai.request(server)
            .post(url)
            .send({ pulse: "45", temperature: "45" })
            .end(function (err, res) {
                expect(database.beginTrans).to.have.been.calledOnce;
                expect(database.beginTrans).to.have.been.calledBefore(database.add);
                expect(database.add).to.have.been.calledTwice;
                expect(database.endTrans).to.have.callCount(0);

                res.should.have.status(400);
                done();
            });
    });

});


