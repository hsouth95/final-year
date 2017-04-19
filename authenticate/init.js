// Authentication method adapted from https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/

var localStrategy = require("passport-local").Strategy,
    db = require("../database2"),
    bcrypt = require("bcrypt-nodejs");

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function (id, done) {
        findUserById(
            id,
            function (results) {
                done(null, results[0]);
            },
            function (err) {
                done(err, null);
            }
        )
    });

    passport.use("local-login", new localStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
    },
        function (req, username, password, done) {
            findUserByUsername(
                username,
                function (results) {
                    if (results && results.length === 1) {
                        if (bcrypt.compareSync(password, results[0].password)) {
                            return done(null, results[0]);
                        }

                        return done(null, false);
                    }

                    return done(null, null);
                },
                function (err) {
                    return done(null, false);
                }
            );
        }
    ));

    passport.use("local-signup", new localStrategy({
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
    },
        function (req, username, password, done) {
            var user = req.body;
            findUserByUsername(
                username,
                function (results) {
                    if (results && results.length === 1) {
                        return done(null, false);
                    } else {
                        createUser(user, function () {
                            return done(null, user);
                        },
                            function () {
                                return done(null, false);
                            });
                        return done(null, false);
                    }
                },
                function (err) {
                    return done(null, false);
                }
            )
        }
    ));

    function findUserByUsername(username, success, error) {
        db.customQuery({
            query: "SELECT user_id, username, firstname, surname, password FROM users WHERE username = ?",
            data: [username],
            success: success,
            error: error
        });
    }

    function findUserById(id, success, error) {
        db.customQuery({
            query: "SELECT user_id, username, firstname, surname FROM users WHERE user_id = ?",
            data: [id],
            success: success,
            error: error
        });
    }

    function createUser(user, success, error) {
        if (user.firstname && user.surname && user.username && user.password) {
            var hashedPassword = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);

            user.password = hashedPassword;

            db.add({
                tableName: "users",
                data: user,
                success: success,
                error: error
            });
        } else {
            error("Not all fields provided.");
        }
    }
}