const { User ,Wallet} = require("../../../../models");
const checkPassword = require("../../../../helper/checkPassword");
const { generateAccessToken, userRefreshAccessToken } = require("../../../../helper/generateAccessToken");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const ejs = require('ejs');
const { mailCogfig } = require('../../../../config/mailConfig');
// exports.register = async (req, res) => {
//     try {
//         const payload = req?.body;
//         const pwd = await bcrypt.hashSync(payload?.password, 10);
//         const reg = await User.create({
//             first_name: payload?.first_name,
//             last_name: payload?.last_name,
//             username: payload?.username,
//             email: payload?.email,
//             password: pwd,
//         });
//         if (reg.id > 0) {
//             const walletFreeCreation = await Wallet.create({
//                 user_id:reg.id,
//                 balance:500,
//                 account_frize:0,
//                 is_free:1,
//             })
//             if(walletFreeCreation){
//                 return res.status(201).json({
//                     status: true,
//                     message: "Registered successfully",
//                     status_code: 201
//                 })
//             }else{
//                 return res.status(201).json({
//                     status: true,
//                     message: "Registered successfully but not wallet free created",
//                     status_code: 201
//                 })
//             }
          
//         } else {
//             return res.status(400).json({
//                 status: true,
//                 message: "Unable to register",
//                 status_code: 400
//             })
//         }
//     } catch (err) {
//         console.log("Error in register authController: ", err);
//         const status = err?.status || 400;
//         const msg = err?.message || "Internal Server Error";
//         return res.status(status).json({
//             msg,
//             status: false,
//             status_code: status
//         })
//     }
// }


exports.register = async (req, res) => {
    try {
        const payload = req?.body;

        const pwd = await bcrypt.hashSync(payload?.password, 10);
        const reg = await User.create({
            first_name: payload?.first_name,
            last_name: payload?.last_name,
            username: payload?.username,
            email: payload?.email,
            password: pwd,
        });

        if (reg.id > 0) {
            const walletFreeCreation = await Wallet.create({
                user_id: reg.id,
                balance: 500,
                account_frize: 0,
                is_free: 1,
            });

            if (walletFreeCreation) {
                const transporter = await mailCogfig()
                const emailTemplatePath = path.join(__dirname,"../../../../",'templates', 'register.ejs');
                const emailContent = await ejs.renderFile(emailTemplatePath, {
                    first_name: reg.first_name, 
                });

                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to: reg?.email, 
                    subject: "Welcome to Our Platform!",
                    html: emailContent, 
                };

                
                await transporter.sendMail(mailOptions);

                return res.status(201).json({
                    status: true,
                    message: "Registered successfully and welcome email sent",
                    status_code: 201,
                });
            } else {
                return res.status(201).json({
                    status: true,
                    message: "Registered successfully, but wallet creation failed",
                    status_code: 201,
                });
            }
        } else {
            return res.status(400).json({
                status: false,
                message: "Unable to register",
                status_code: 400,
            });
        }
    } catch (err) {
        console.error("Error in register function: ", err);
        const status = err?.status || 500;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            status: false,
            message: msg,
            status_code: status,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const username = req?.body?.username;
        const password = req?.body?.password;
        // console.log(password);
        const user = await User.findOne({
            attributes: ['id', 'username', 'first_name', 'last_name', 'password', 'email', 'dob', 'is_active'],
            where: {
                username: username,
            }
        });
        const passwordMatch = await checkPassword(password, user?.password);
        if (!passwordMatch) {
            return res.status(400).json({
                status: false,
                message: 'Invalid credential',
                status_code: 400,
            });
        }
        const token = await generateAccessToken(user);
        const refresh = await userRefreshAccessToken(user);
        await User.update(
            { refresh_token: refresh },
            { where: { id: user.id } }
        );
        // const userDetails= {
        //     id:user?.id,
        //     username:user?.username,
        //     fullname:user?.fullname,
        //     email:user?.email,
        //     phone:user?.phone,
        //     dob:user?.dob,
        //     is_active:user?.is_active
        // }
        return res.status(200).json({
            status: true,
            message: 'User loggedin successfully',
            status_code: 200,
            // user_data: userDetails,
            user_token: token,
            refresh_token: refresh
        });
    } catch (err) {
        console.log("Error in login authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}

exports.getNewToken = async (req, res) => {
    try {
        const token = req?.body?.refresh_token;
        const decoded = jwt.decode(token);
        const userId = decoded?.id;
        const userDetails = await User.findOne({
            where: {
                id: userId,
                refresh_token: token,
            },
        });
        if (!userDetails) {
            res.status(403).json({
                status: false,
                status_code: 403,
                message: "Invalid refresh token or user not found",
            })
        }
        const accesstoken = await generateAccessToken(userDetails);
        const refreshtoken = await userRefreshAccessToken(userDetails);
        const user = await User.findByPk(userId);
        const dataUpdate = user.update({ refresh_token: refreshtoken })
        if (dataUpdate) {
            res.status(200).json({
                status: true,
                status_code: 200,
                user_token: accesstoken,
                refresh_token: refreshtoken,
                message: "Access token generated successfully.",
            });
        } else {
            res.status(403).json({
                status: false,
                status_code: 403,
                message: "updation failed",
            })
        }
    } catch (err) {
        console.log("Error in get new token authController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }


}