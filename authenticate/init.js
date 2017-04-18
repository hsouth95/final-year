// Authentication method adapted from https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/

var localStrategy = require("passport-local").Strategy,
    db = require("../database2");

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
                        if (results[0].password === password) {
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
}

function findUserByUsername(username, success, error) {
    db.customQuery({
        query: "SELECT * FROM users WHERE username = ?",
        data: [username],
        success: success,
        error: error
    });
}

function findUserById(id, success, error) {
    db.customQuery({
        query: "SELECT * FROM users WHERE user_id = ?",
        data: [id],
        success: success,
        error: error
    });
}
