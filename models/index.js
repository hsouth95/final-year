var fs = require("fs"),
    moment = require("moment");

var models = {};

models.validate = function (modelName, data, errorCallback, successCallback) {
    fs.readFile(__dirname + "/models.json", "utf8", function (err, dataModels) {
        if (err) errorCallback(err.message);

        obj = JSON.parse(dataModels);

        if (obj.hasOwnProperty(modelName)) {
            var validateFieldResponse = models.validateFields(data, obj[modelName]);
            if (validateFieldResponse.status) {
                successCallback(models.trimObject(data, obj[modelName]));
            } else {
                errorCallback(validateFieldResponse.message);
            }
        } else {
            errorCallback("Cannot find model to validate against.");
        }

    });
}

models.validateFields = function (data, dataModel) {
    for (var attribute in dataModel) {
        if (dataModel.hasOwnProperty(attribute)) {
            var dataAttribute = data[attribute];
            if (dataAttribute) {
                var validField = false;
                switch (dataModel[attribute].type) {
                    case "i":
                        validField = models.validateInteger(dataModel[attribute], parseInt(dataAttribute));
                        break;
                    case "t":
                        validField = true;
                        break;
                    case "d":
                        validField = models.validateDate(dataModel[attribute], dataAttribute);
                        break;
                    case "ti":
                        validField = true;
                        break;
                    default:
                        break;
                }

                if (!validField) {
                    return { status: false, message: attribute + " failed validation" };
                }
            } else if (dataModel[attribute].requiredCreation) {
                // This was a required field
                return { status: false, message: attribute + " was required but not present." };
            }
        }
    }

    return { status: true };
}

models.validateInteger = function (modelAttribute, dataAttribute) {
    // Check value is a valid integer
    if (typeof dataAttribute === "number" && (dataAttribute % 1) === 0) {
        if (modelAttribute.minLength &&
            dataAttribute.toString().length < modelAttribute.minLength) {
            return false;
        }
        if (modelAttribute.maxLength &&
            dataAttribute.toString().length > modelAttribute.minLength) {
            return false;
        }
        if (modelAttribute.range) {
            var values = modelAttribute.range.split("-");
            if (dataAttribute < values[0] || dataAttribute > values[1]) {
                return false;
            }
        }

        return true;
    }

    return false;
}

models.validateDate = function (modelAttribute, dataAttribute) {
    if (moment(dataAttribute, "YYYY-MM-DD", true).isValid()) {
        if (modelAttribute.dateAllowed) {
            return models.isDateAllowed(moment(dataAttribute), modelAttribute.dateAllowed);
        }
    }
}

models.isDateAllowed = function (date, dateFormula) {
    var comparedDateType = dateFormula.match(/\((.*)\)/)[1],
        comparedDate = null;

    if (comparedDateType === "NOW") {
        comparedDate = moment();
    } else {
        comparedDate = moment(comparedDateType, "YYYY-MM-DD");
    }

    var endOfDate = dateFormula.indexOf("}"),
        startOfComparedDate = dateFormula.indexOf("("),
        comparator = dateFormula.substring(endOfDate + 1, startOfComparedDate);

    switch (comparator) {
        case "=":
            return date.isSame(comparedDate, "day");
        case ">":
            return date.isAfter(comparedDate, "day");
        case "<":
            return date.isBefore(comparedDate, "day");
        case "=>":
        case ">=":
            return date.isSameOrAfter(comparedDate, "day");
        case "<=":
        case "=<":
            return date.isSameOrBefore(comparedDate, "day");

        default:
            return false;
    }
}

models.trimObject = function (data, dataModel) {
    var returnedObject = {};
    for (var attribute in dataModel) {
        if (dataModel.hasOwnProperty(attribute)) {
            if (data[attribute]) {
                returnedObject[attribute] = data[attribute];
            }
        }
    }

    return returnedObject;
}

module.exports = models;