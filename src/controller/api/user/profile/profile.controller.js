
const {User} = require("../../../../models")


exports.update = async (req,res) =>{
    try{
        const payload = req?.body
        const userId = req?.id
        const profileUpdate = await User.update({
            full_name:payload?.full_name,
            first_name:payload?.first_name,
            last_name:payload?.last_name,
            email :payload?.email ,
            phone :payload?.phone ,
            dob:payload?.dob
        },{
            where:{
                id:userId
            }
        })
        if(profileUpdate){
            res.status(200).json({
                message:"update successfully",
                status:true,
                status_code:200
            })
        }else{
            res.status(400).json({
                message:"update successfully",
                status:false,
                status_code:400
            })
        }
    }catch (err) {
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