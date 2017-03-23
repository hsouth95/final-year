var fs = require("fs"),
    moment = require("moment");

var models = {};

models.validate = function (modelName, data, errorCallback, successCallback) {
    fs.readFile(__dirname + "/models.json", "utf8", function (err, models) {
        if (err) errorCallback(err.message);

        obj = JSON.parse(models);

        if (obj.hasOwnProperty(modelName)) {
            if (validateFields(data, obj[modelName])) {
                successCallback();
            } else {
                errorCallback("failed validation");
            }
        } else {
            errorCallback("Cannot find model to validate against.");
        }

    });
}

models.validateFields = function (data, model) {
    for (var attribute in model) {
        if (model.hasOwnProperty(attribute)) {
            var dataAttribute = data[attribute];
            if (dataAttribute) {
                var validField = false;
                switch (model[attribute].type) {
                    case "i":
                        validField = validateInteger(model[attribute], parseInt(dataAttribute));
                        break;
                    case "t":
                        validField = true;
                        break;
                    case "d":
                        validField = validateDate(model[attribute], dataAttribute);
                        break;
                    case "ti":
                        validField = true;
                        break;
                    default:
                        break;
                }

                if (!validField) {
                    return false;
                }
            } else if (model[attribute].requiredCreation) {
                // This was a required field
                return false;
            }
        }
    }

    return true;
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
            return isDateAllowed(moment(dataAttribute), modelAttribute.dateAllowed);
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

module.exports = models;