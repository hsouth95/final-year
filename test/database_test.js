var chai = require("chai"),
    mockery = require("mockery"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    should = chai.should(),
    expect = chai.expect;

chai.use(sinonChai);

describe("checkOptions", function () {
    var mysql,
        database;


    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mysql = {
        }

        mysql.createPool = sinon.stub();

        mockery.registerMock("mysql", mysql);

        database = require("../database2");
    });

    afterEach(function () {
        mockery.disable();
    });

    it("returns true on valid options", function () {
        var validOptions = {
            tableName: "test",
            success: function () { return "test"; },
            error: function () { return "test"; }
        };

        expect(database.checkOptions(validOptions)).to.be.true;
    });

    it("returns false on invalid options", function () {
        var validOptions = {
            success: function () { return "test"; },
            error: function () { return "test"; }
        };

        expect(database.checkOptions(validOptions)).to.be.false;
    });

    it("returns false on empty table name", function () {
        var validOptions = {
            tableName: null,
            success: function () { return "test"; },
            error: function () { return "test"; }
        };

        expect(database.checkOptions(validOptions)).to.be.false;
    });
});

describe("beginTrans", function () {
    var mysql,
        database,
        databaseStub;

    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        mysql = {
        }

        mysql.createPool = sinon.stub();
        databaseStub = sinon.stub();
    });

    afterEach(function () {
        mockery.disable();
    });

    it("should return a error on an error with getting the database connection", function (done) {
        databaseStub.getConnection = sinon.stub().callsFake(function (callback) {
            callback(new Error("Error"), null);
        });

        mysql.createPool.returns(databaseStub);
        mockery.registerMock("mysql", mysql);

        database = require("../database2");

        database.beginTrans(function (err) {
            expect(err).to.exist;
            expect(err.message).to.equal("Error");
            done();
        }, function () {
            throw new Error("Shouldn't be here...");
        });
    });

    it("should return a error on an error with starting the transaction", function (done) {
        var connectionStub = sinon.stub();
        connectionStub.beginTransaction = sinon.stub().callsFake(function (callback) {
            callback(new Error("Error"));
        });

        databaseStub.getConnection = sinon.stub().callsFake(function (callback) {
            callback(null, connectionStub);
        });

        mysql.createPool.returns(databaseStub);
        mockery.registerMock("mysql", mysql);

        database = require("../database2");

        database.beginTrans(function (err) {
            expect(err).to.exist;
            expect(err.message).to.equal("Error");
            done();
        }, function () {
            throw new Error("Shouldn't be here...");
        });
    });

    it("should return on a successful operation", function (done) {
        var connectionStub = sinon.stub();
        connectionStub.beginTransaction = sinon.stub().callsFake(function (callback) {
            callback(null);
        });

        databaseStub.getConnection = sinon.stub().callsFake(function (callback) {
            callback(null, connectionStub);
        });

        mysql.createPool.returns(databaseStub);
        mockery.registerMock("mysql", mysql);

        database = require("../database2");

        database.beginTrans(function (err) {
            throw new Error("Shouldn't have erred");
        }, function () {
            done();
        });
    });

    it("should error on a duplicated beginTrans", function (done) {
        var connectionStub = sinon.stub();
        connectionStub.beginTransaction = sinon.stub().callsFake(function (callback) {
            callback(null);
        });

        databaseStub.getConnection = sinon.stub().callsFake(function (callback) {
            callback(null, connectionStub);
        });

        mysql.createPool.returns(databaseStub);
        mockery.registerMock("mysql", mysql);

        database = require("../database2");

        database.beginTrans(function (err) {
            throw new Error("Shouldn't have erred");
        }, function () {
            database.beginTrans(function (err) {
                expect(err).to.exist;
                expect(err.message).to.equal("Transaction already in progress.");
                done();
            }, function () {
                throw new Error("Should have erred");
            });
        });
    });
});