const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute")

const defaultRoutes = [
    {
        prefix: "/auth",
        route: authRoute,
    },
   
   
]
defaultRoutes.forEach((route) => {
    if (route.middleware) {
        router.use(route.prefix, route.middleware, route.route);
    } else {
        router.use(route.prefix, route.route);
    }
});

module.exports = router;