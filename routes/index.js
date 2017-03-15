var routes = require("express").Router(),
    models = require("./models"),
    views = require("./views");

routes.use("/models", models);
routes.use("/view", views);

module.exports = routes;