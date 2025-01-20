const {User}=require("../../../../models");
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