const express = require("express");
const router = express.Router();

const userLoadRoute = require("./user/userLoad")
const userAuthRoute = require("./user/authRoute");

const adminLoad = require("./admin/adminLoad")

const defaultRoutes = [
    {
        prefix: "/user",
        route: userLoadRoute,
    },
    {
        prefix: "/admin",
        route: adminLoad,
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