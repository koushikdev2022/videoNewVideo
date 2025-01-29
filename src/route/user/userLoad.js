const express = require("express");
const router = express.Router();
const isUserAuthenticateMiddleware = require("../../middleware/user/isUserAuthenticateMiddleware")
const authRoute = require("./authRoute")
const userOtpRoute = require("./userOtpRoute");
const videoAttributeRoute = require('./videoAttributeRoute')
const videoRoute = require("./videoRoute")
const tokenRoute = require("./tokenRoute")
const forgetPasswordRoute = require("./forgetPasswordRoute");
const planRoute = require("../user/planRoute");
const paymentRoute = require("./paymentRoute")
const addressRoute =require("./addressRoute")

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
    {
        prefix: "/otp",
        route: userOtpRoute,
    },
    {
        prefix: "/token",
        route: tokenRoute,
    },
    {
        prefix: "/forget-password",
        route: forgetPasswordRoute,
    },
    {
        prefix: "/plan",
        route: planRoute,
        middleware:isUserAuthenticateMiddleware
    },
    {
        prefix: "/payment",
        route: paymentRoute,
        middleware:isUserAuthenticateMiddleware
    },
    {
        prefix: "/address",
        route: addressRoute,
        middleware:isUserAuthenticateMiddleware
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