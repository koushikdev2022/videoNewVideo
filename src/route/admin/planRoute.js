const express = require("express");
const planRoute = express.Router();

const planController = require("../../controller/api/admin/plan/plan.controller")

planRoute.post('/create',planController.create);

module.exports = planRoute;