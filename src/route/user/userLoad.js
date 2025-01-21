const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute")
const userOtpRoute = require("./userOtpRoute");
const videoAttributeRoute = require('./videoAttributeRoute')
const videoRoute = require("./videoRoute")
const tokenRoute = require("./tokenRoute")
<<<<<<< HEAD
const fileUpload = require("./fileUploadRoute")
=======
const forgetPasswordRoute = require("./forgetPasswordRoute");
>>>>>>> 88167d0a153f0a9b9aabc71b49eccb86202da949

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
<<<<<<< HEAD
        prefix: "/file",
        route:fileUpload,
    }
   
=======
        prefix: "/forget-password",
        route: forgetPasswordRoute,
    },
>>>>>>> 88167d0a153f0a9b9aabc71b49eccb86202da949
   
]
defaultRoutes.forEach((route) => {
    if (route.middleware) {
        router.use(route.prefix, route.middleware, route.route);
    } else {
        router.use(route.prefix, route.route);
    }
});

module.exports = router;