const express = require("express");
const planRoute = express.Router();

const planController = require("../../controller/api/admin/plan/plan.controller")
const planValidation = require("../../validations/admin/plan/createPlanValidation")
const updatePlanValidation = require("../../validations/admin/plan/updatePlanValidation")

planRoute.post('/create',planValidation,planController.create);
planRoute.post('/update',updatePlanValidation,planController.update);
planRoute.post('/list',planController.list);
planRoute.post('/status',planController.status);


planRoute.post('/token-list',planController.tokenList);
planRoute.post('/token-update',planController.tokenUpdate);

module.exports = planRoute;