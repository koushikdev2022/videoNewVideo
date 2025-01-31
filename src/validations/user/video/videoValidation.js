const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const {Plan,Transaction} = require("../../../models")

const videoValidation = async (req, res, next) => {
    const payload = req?.body;
    const t = req.t;
    const validationRules = [
            body('video')
                .exists()
                .withMessage("video is required")
                .bail()
                .matches(/^media/).withMessage("video must start with 'media'")
                .not().matches(/^https?:\/\//).withMessage("http and https URLs are not allowed"),
            body('video_type')
                .exists()
                .withMessage("video_type is required"),
            body('thumbnail')
                .exists()
                .withMessage("thumbnail is required"),
        ];

    await Promise.all(validationRules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.param,
            value: error.value,
            message: error.msg,
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            data: formattedErrors,
            status_code: 422,
        });
    }

    next();
};

module.exports = videoValidation;
