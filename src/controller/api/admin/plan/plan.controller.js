
const {Plan} = require("../../../../models")


exports.create = async(req,res) =>{
    try{
        const payload = req?.body
        const createData = await Plan.create({
            plan_name:payload?.plan_name,
            credit:payload?.credit,
            price:payload?.price
        })
        if(createData){
            res.status(201).json({
                messsage:"create successfully",
                status:true,
                status_code:201,
            })
        }else{
            res.status(400).json({
                messsage:"creation failed",
                status:false,
                status_code:400,
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


exports.update = async(req,res) =>{
    try{
        const payload = req?.body
        const data = await Plan?.findByPk(payload?.id)
        const updateData = await data.update({
            plan_name:payload?.plan_name,
            credit:payload?.credit,
            price:payload?.price
        })
        if(updateData){
            res.status(200).json({
                messsage:"update successfully",
                status:true,
                status_code:200,
            })
        }else{
            res.status(400).json({
                messsage:"updation failed",
                status:false,
                status_code:400,
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