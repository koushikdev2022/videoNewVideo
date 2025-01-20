const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const {User}=require("../../../models");

const userRegistrationValidation = async (req, res, next) => {
    const payload = req?.body;
    const t = req.t;

    const validationRules = [
        body('first_name')
            .notEmpty()
            .withMessage("first_name is required")
            .isString()
            .withMessage("first_name must be string"),
        body('last_name')
            .notEmpty()
            .withMessage("last_name is required")
            .isString()
            .withMessage("last_name must be string"),
        body('username')
            .notEmpty()
            .withMessage("username is required")
            .isString()
            .withMessage("username is must be string")
            .custom(async (value) => {
                if (value) {
                    const isExistUser = await User.findOne({ where: { username: value } });
                    if (isExistUser) throw new Error("username already taken by other");
                }
            }),
        body('email')
            .notEmpty()
            .withMessage('email is required')
            .isEmail()
            .withMessage( "email is not valid format")
            .custom(async (value) => {
                if (value) {
                    const isExistUser = await User.findOne({ where: { email: value } });
                    if (isExistUser) throw new Error("email already taken by other");
                }
            }),
        body('password')
            .notEmpty()
            .withMessage('password is required')
            .isString()
            .withMessage('password must be string')
            .isLength({ min: 8 })
            .withMessage('password minimum 8 character'),
        body('phone')
            .notEmpty()
            .withMessage('phone is required')
            .isString()
            .withMessage('phone must be string')
            .isMobilePhone()
            .withMessage('invalid phone no')
            .custom(async (value) => {
                if (value) {
                    const isExistUser = await User.findOne({ where: { phone: value } });
                    if (isExistUser) throw new Error('phone no already taken by other');
                }
            }),
        body('dob')
            .notEmpty()
            .withMessage('dob is required')
            .isDate({ format: 'YYYY-MM-DD' })
            .withMessage('Date of birth must be in the format YYYY-MM-DD.'),
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path,
            value: error.value,
            message: error.msg,
        }));
        return res.status(422).json({
            success: false,
            message: "Validation failed",
            data: formattedErrors,
            status_code: 422
        });
    }
    next();
}

module.exports = userRegistrationValidation;