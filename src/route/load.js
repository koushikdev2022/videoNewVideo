const express = require("express");
const router = express.Router();

const userLoadRoute = require("./user/userLoad")

const defaultRoutes = [
    {
        prefix: "/user",
        route: userLoadRoute,
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