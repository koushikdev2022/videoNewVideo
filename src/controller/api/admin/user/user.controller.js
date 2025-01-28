const {User} = require("../../../../models")

exports.list = async(req,res)=>{
       try{
            const limit = req?.body?.limit || 10;
            const page = req?.body?.page || 1;
            const offset = (page-1)*limit;
            const query = {
                where:{},
                order:[['created_at','desc']],
                limit:limit,
                offset:offset,
            }
            const totalUser = await User.count({
                where:query.where,
                distinct:true
            })
            const user = await User.findAll(query)
            if(user){
                res.send(200).json({
                    messsage:"data found",
                    status:true,
                    status_code:200,
                    data:user,
                    data_count:totalUser,
                    page:page
                })
            }else{
                res.send(200).json({
                    messsage:"no data found",
                    status:true,
                    status_code:200,
                    data:user,
                    data_count:totalUser,
                    page:page
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


exports.status = async(req,res)=>{
    try{
        const userid = req?.body?.id
        const userData = await  User?.findByPk(userid)
        const updateData = await userData?.update({
                 is_active:!updateData?.is_active
        })
        if(updateData){
            res.send(200).json({
                messsage:"update successfully",
                status:true,
                status_code:200,
            })
        }else{
            res.send(400).json({
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