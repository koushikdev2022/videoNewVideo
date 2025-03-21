const express = require("express")
const pdfRoute = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");


const upload = multer({ storage: multer.memoryStorage() });

const pdfController = require("../../controller/api/user/pdf/pdf.controller")

pdfRoute.post('/page-count',upload.single("pdf"),pdfController.pageCount)


module.exports = pdfRoute;