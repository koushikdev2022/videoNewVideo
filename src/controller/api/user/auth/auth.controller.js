const {User}=require("../../../../models");
const checkPassword = require("../../../../helper/checkPassword");
const { generateAccessToken, userRefreshAccessToken } = require("../../../../helper/generateAccessToken");
const jwt = require('jsonwebtoken');
exports.register = async (req,res) =>{
    try{
        const payload = req?.body;
        const reg = await User.create({
            first_name:payload?.first_name,
            last_name:payload?.last_name,
            username:payload?.username,
            email:payload?.email,
            password:payload?.password,
            phone:payload?.phone,
            dob:payload?.dob
        });
        if(reg.id>0){
            return res.status(201).json({
                status:true,
                message:"Registered successfully",
                status_code:201
            })
        }else{
            return res.status(400).json({
                status:true,
                message:"Unable to register",
                status_code:400
            })
        }
    }catch(err){
        console.log("Error in register authController: ",err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status:false,
            status_code:status
        })
    }
}

exports.login = async(req,res) =>{
    try{
        const username = req?.body?.username;
        const password = req?.body?.password;
        const user = await User.findOne({
            attributes: ['id', 'username', 'first_name', 'last_name', 'password', 'email', 'phone', 'dob', 'is_active'],
            where: {
                username: username,
            }
        });
        const passwordMatch = await checkPassword(password, user?.password);
        if (!passwordMatch) {
            throw new HttpException(422, "Invalid credential");
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
    }catch(err){
        console.log("Error in login authController: ",err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status:false,
            status_code:status
        })
    }
}

exports.getNewToken = async(req,res) =>{
    try{
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
            throw new HttpException(403, "Invalid refresh token or user not found")
        }
        const accesstoken = await generateAccessToken(userDetails);
        const refreshtoken = await userRefreshAccessToken(userDetails);
        res.status(200).json({
            status: true,
            status_code: 200,
            token: accesstoken,
            refresh_token:refreshtoken,
            message: "Access token generated successfully.",
        });
    }catch(err){
        console.log("Error in get new token authController: ",err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status:false,
            status_code:status
        })
    }
}