
const {Plan,Token} = require("../../../../models")


exports.tokenList = async(req,res)=>{
    try{  
            const allData = await Token.findAll({
                order:[['id','DESC']],
                where:{
                    is_delete:0,
                    is_active:1
                }
            })
            if(allData){
               return  res.status(200).json({
                    messsage:"data found successfully",
                    status:true,
                    data:allData,
                    status_code:200,
                })
            }else{
               return res.status(200).json({
                    messsage:"data found successfully",
                    status:true,
                    data:allData,
                    status_code:200,
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
exports.tokenUpdate = async(req,res)=>{
    try{
            const payload = req?.body
            const id = req?.body?.id
            console.log(id)
            if(!id){
                return res.status(422).json({
                    messsage:"id required",
                    status:false,
                    status_code:422,
                })
            }

            const update = await Token?.update({
                plan_name:payload?.plan_name,
                price:payload?.price,
                image_count:payload?.image_count,
            },{where:{
                id:id 
            }})
            if(update){
                return res.status(200).json({
                    message:"update successfully",
                    status:true,
                    status_code:200,
                }) 
            }else{
                return res.status(400).json({
                    message:"updation failed",
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
exports.create = async(req,res) =>{
    try{
        const payload = req?.body
        const createData = await Plan.create({
            plan_name:payload?.plan_name,
            credit:payload?.credit,
            price:payload?.price,
            currency:payload?.currency
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
            price:payload?.price,
            currency:payload?.currency
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

exports.list = async (req,res) =>{
    try {
        const limit = req?.body?.limit || 10;
        const page = req?.body?.page || 1;
        const offset = (page - 1) * limit;
        const query = {
            where: {},
            order: [['created_at', 'desc']],
            limit: limit,
            offset: offset,
        }
        const totalPlan = await Plan.count({
            where: query.where,
            distinct: true
        })
        const plan = await Plan.findAll(query)
        if (plan) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                data: plan,
                data_count: totalPlan,
                page: page
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: plan,
                data_count: totalPlan,
                page: page
            })
        }
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


exports.status = async(req,res)=>{
    try {
        const planid = req?.body?.id
        if(!planid){
            res.status(422).json({
                messsage: "id is required",
                status: false,
                status_code: 422,
            })
        }
        if (!Number.isInteger(planid)) {
            res.status(422).json({
                message: "id must be an integer", 
                status: false,
                status_code: 422,
            });
        }
        const planData = await Plan?.findByPk(planid)
        const update = await planData?.update({
            is_active: !planData?.is_active
        })
        if (update) {
            res.status(200).json({
                messsage: "update successfully",
                status: true,
                status_code: 200,
            })
        } else {
            res.status(400).json({
                messsage: "updation failed",
                status: false,
                status_code: 400,
            })
        }
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