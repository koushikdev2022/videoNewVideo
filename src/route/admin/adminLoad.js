const express = require("express");
const router = express.Router();

const adminRoute = require("./adminRoute")


const defaultRoutes = [
    {
        prefix: "/",
        route: adminRoute,
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