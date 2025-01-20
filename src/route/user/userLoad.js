const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute")
const videoAttributeRoute = require('./videoAttributeRoute')
const videoRoute = require("./videoRoute")

const defaultRoutes = [
    {
        prefix: "/auth",
        route: authRoute,
    },
    {
        prefix: "/video_attribute",
        route: videoAttributeRoute,
    },
    {
        prefix: "/video",
        route: videoRoute,
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