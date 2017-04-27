var mysql = require("mysql"),
    database = mysql.createPool({
        connectionLimit: 100,
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "rbch"
    }),
    isTransactionPending = false,
    transactionConnection = null;

checkOptions = function (options) {
    if (options && options.tableName && options.success && options.error) {
        return true;
    } else {
        return false;
    }
}

beginTrans = function (error, success) {
    if (!isTransactionPending) {
        database.getConnection(function (err, connection) {
            if (err) {
                error(err);
            } else {
                transactionConnection = connection;
                connection.beginTransaction(function (err) {
                    isTransactionPending = true;
                    if (err) {
                        error(err);
                    } else {
                        success();
                    }
                })
            }
        });
    } else {
        error(new Error("Transaction already in progress."));
    }
}

endTrans = function (error, success) {
    if (isTransactionPending && transactionConnection) {
        transactionConnection.commit(function (err) {
            if (err) {
                error(err);
            } else {
                isTransactionPending = false;
                transactionConnection = null;
                success();
            }
        });
    } else {
        error(new Error("Transaction has not been started."));
    }
}

list = function (options) {
    if (!checkOptions(options)) {
        throw new Error("Options not provided.");
    }
    var query = "SELECT * FROM ??";

    if (isTransactionPending) {
        transactionConnection.query(query, [options.tableName], function (err, result) {
            if (err) {
                options.error(err.message);
            }

            options.success(result);
        });
    } else {
        database.query(query, [options.tableName], function (err, results) {
            if (err) {
                options.error(err);
            } else {
                options.success(results);
            }
        });
    }
}

filteredList = function (options) {
    if (!checkOptions(options) || !options.filteredField || !options.filteredValue) {
        throw new Error("Options not provided.");
    }
    var query = "SELECT * FROM ?? WHERE ?? = ?";

    if (isTransactionPending) {
        transactionConnection.query(query, [options.tableName, options.filteredField, options.filteredValue], function (err, result) {
            if (err) {
                options.error(err.message);
            }

            options.success(result);
        });
    } else {
        database.query(query, [options.tableName, options.filteredField, options.filteredValue], function (err, results) {
            if (err) {
                options.error(err);
            } else {
                options.success(results);
            }
        });
    }
}

add = function (options) {
    if (!checkOptions(options) || !options.data) {
        throw new Error("Options not provided.");
    }

    var query = "INSERT INTO " + options.tableName + " SET ?";

    if (isTransactionPending) {
        transactionConnection.query(query, options.data, function (err, results) {
            if (err) {
                return transactionConnection.rollback(function () {
                    options.error(err)
                });
            }

            options.success(results.insertId);
        });
    } else {
        database.query(query, options.data, function (err, results) {
            if (err) {
                options.error(err);
            } else {
                options.success(results.insertId);
            }
        });
    }
}

getById = function (options) {
    if (!checkOptions(options) || !options.id || !options.attributeName) {
        throw new Error("Options not provided.");
    }

    var query = "SELECT * FROM ?? WHERE ?? = ?";

    if (isTransactionPending) {
        transactionConnection.query(query, [options.tableName, options.attributeName, options.id], function (err, results) {
            if (err) {
                return transactionConnection.rollback(function () {
                    options.error(err)
                });
            }

            options.success(results);
        });
    } else {
        database.query(query, [options.tableName, options.attributeName, options.id], function (err, results) {
            if (err) {
                options.error(err);
            } else {
                options.success(results);
            }
        });
    }
}

customQuery = function (options) {
    if (isTransactionPending) {
        transactionConnection.query(options.query, options.data, function (err, results) {
            if (err) {
                return transactionConnection.rollback(function () {
                    options.error(err)
                });
            }

            options.success(results);
        });
    } else {
        database.query(options.query, options.data, function (err, results) {
            if (err) {
                options.error(err);
            } else {
                options.success(results);
            }
        });
    }
}

module.exports = {
    checkOptions: checkOptions,
    beginTrans: beginTrans,
    endTrans: endTrans,
    customQuery: customQuery,
    list: list,
    add: add,
    getById: getById,
    filteredList: filteredList
}; 