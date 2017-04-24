var chai = require("chai"),
    mockery = require("mockery"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    should = chai.should(),
    expect = chai.expect;

chai.use(sinonChai);

describe("models.validate", function () {
    var models,
        fs,
        validDataModel,
        validData;

    beforeEach(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        fs = {};
        validDataModel = {
            test: {
                id: {
                    type: "i",
                    requiredCreation: false
                },
                arg1: {
                    type: "i",
                    requiredCreation: true,
                    minLength: 3,
                    maxLength: 4,
                    range: "150-2500"
                },
                arg2: {
                    type: "d",
                    requiredCreation: true,
                    dataFormat: "YYYY-MM-DD",
                    dateAllowed: "{}<=(NOW)"
                },
                arg3: {
                    type: "t",
                    requiredCreation: true
                },
                arg4: {
                    type: "de",
                    minIntLength: 2,
                    maxIntLength: 4,
                    minDecLength: 2,
                    maxDecLength: 3,
                    range: "95.0-1050.555"
                }
            }
        };

        validData = {
            id: 1,
            arg1: 200,
            arg2: "2017-03-28",
            arg3: "This is a test",
            arg4: 150.555
        };

        fs.readFile = sinon.stub().callsFake(function (arg1, arg2, callback) {
            callback(null, JSON.stringify(validDataModel));
        });

        mockery.registerMock("fs", fs);
        models = require("../models");
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("should return a validated object", function (done) {
        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                expect(data).to.eql(validData);
                done();
            });
    });

    it("should return an error on a missing required field", function (done) {
        validData.arg1 = null;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a text value in a integer format", function (done) {
        validData.arg1 = "wrongvalue";

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of minLength integer", function (done) {
        validData.arg1 = 1;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });
    it("should return an error on a out of maxLength integer", function (done) {
        validData.arg1 = 9999999;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });
    it("should return an error on a out of lower range integer", function (done) {
        validData.arg1 = 149;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });
    it("should return an error on a out of upper range integer", function (done) {
        validData.arg1 = 2501;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should succeed on a on lower range value", function (done) {
        validData.arg1 = 150;

        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                done();
            });
    });

    it("should succeed on a on upper range value", function (done) {
        validData.arg1 = 2500;

        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                done();
            });
    });

    it("should return an error on an invalid date format", function (done) {
        validData.arg2 = "28-03-2017";

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on another invalid date format", function (done) {
        validData.arg2 = "2017/03/28";

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a text value in a decimal format", function (done) {
        validData.arg4 = "wrongvalue";

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of minIntLength decimal", function (done) {
        validData.arg4 = 1;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of maxIntLength decimal", function (done) {
        validData.arg1 = 9999999;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of minDecLength decimal", function (done) {
        validData.arg4 = 5;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of maxDecLength decimal", function (done) {
        validData.arg1 = 9999999;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should return an error on a out of lower range decimal", function (done) {
        validData.arg1 = 94.99;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });
    it("should return an error on an out of upper range decimal", function (done) {
        validData.arg1 = 1050.556;

        models.validate("test", validData, function (message) {
            done();
        },
            function (data) {
                assert.fail("Expected a error, got a successful response");
                done();
            });
    });

    it("should succeed on an lower range decimal value", function (done) {
        validData.arg1 = 95.0;

        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                done();
            });
    });

    it("should succeed on a on upper range decimal value", function (done) {
        validData.arg1 = 1050.555;

        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                done();
            });
    });

    it("should succeed on an integer value in a decimal field", function (done) {
        validData.arg1 = 1000;

        models.validate("test", validData, function (message) {
            assert.fail(message);
            done();
        },
            function (data) {
                done();
            });
    });

});