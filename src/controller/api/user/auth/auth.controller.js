const {User}=require("../../../../models");
exports.register = async (req,res) =>{
    try{
        
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