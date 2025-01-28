const express = require("express");
const planRoute = express.Router();

const planController = require("../../controller/api/admin/plan/plan.controller")
const planValidation = require("../../validations/admin/plan/createPlanValidation")
const updatePlanValidation = require("../../validations/admin/plan/updatePlanValidation")

planRoute.post('/create',planValidation,planController.create);
planRoute.post('/update',updatePlanValidation,planController.update);
planRoute.post('/list',updatePlanValidation,planController.update);

module.exports = planRoute;