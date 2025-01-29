const { validationResult } = require('express-validator');
const { body } = require('express-validator');


const addAddressValidation = async (req, res, next) => {
    const payload = req?.body;
    const t = req.t;
    const validationRules = [
        body('address_line1')
            .exists()
            .withMessage("address_line1 is required"),
        body('city')
            .exists()
            .withMessage("city is required"),
        body('state')
            .exists()
            .withMessage("state is required"),
        body('postal_code')
            .exists()
            .withMessage("postal_code is required"),
        body('country')
            .exists()
            .withMessage("country is required")
       
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

module.exports = addAddressValidation;
