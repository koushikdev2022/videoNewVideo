const express = require("express")

const paymentRoute = express.Router()

const paymentController = require("../../controller/api/user/payment/payment.controller")
const createPaymentValidation = require("../../validations/user/payment/createPaymentValidation");
const walletUpdateValidation = require("../../validations/user/payment/walletUpdateValidation")
const transactionFailed = require("../../validations/user/payment/transactionFailed")

paymentRoute.post('/initiate-payment',createPaymentValidation,paymentController.initiate)
paymentRoute.post('/stripe-payment-intent',createPaymentValidation,paymentController.stripePaymentIntent)
paymentRoute.post('/wallet-update',walletUpdateValidation,paymentController.walletUpdate)
paymentRoute.post('/transaction-failed',transactionFailed,paymentController.transactionFailed)

module.exports = paymentRoute