const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const {Plan,Transaction} = require("../../../models");


const walletUpdateValidation = async (req, res, next) => {
    const payload = req?.body;
    const t = req.t;
    const validationRules = [
        body('plan_id')
            .exists()
            .withMessage("plan_id is required")
            .isInt()
            .withMessage("plan_id must be integer")
            .custom(async (value) => {
                            if (value) {
                                const plan = await Plan.findOne({ where: { id:  payload?.plan_id } });
                                if (!plan) {
                                    throw new Error( "plan does not exist")
                                }
                            }
                        }),
        body('transaction_id')
                    .exists()
                    .withMessage("transaction_id is required")
                    .isInt()
                    .withMessage("transaction_id must be integer")
                    .custom(async (value) => {
                                    if (value) {
                                        const plan = await Transaction.findOne({ where: { id:  payload?.transaction_id,user_id:req?.user?.id } });
                                        if (!plan) {
                                            throw new Error( "Transaction does not exist")
                                        }
                                    }
                                }),
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

module.exports = walletUpdateValidation;
