const { User,Transaction,Wallet,Plan,Video } = require("../../../../models")

exports.list = async (req, res) => {
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
        const totalUser = await User.count({
            where: query.where,
            distinct: true
        })
        const user = await User.findAll(query)
        const totalPage = Math.ceil(totalUser/limit)
        if (user) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                data: user,
                data_count: totalUser,
                total_page:totalPage,
                page: page
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: user,
                total_page:totalPage,
                data_count: totalUser,
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


exports.status = async (req, res) => {
    try {
        const userid = req?.body?.id
        const userData = await User?.findByPk(userid)


        const update = await userData?.update({
            is_active: !userData?.is_active
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

exports.transaction = async(req,res)=>{
    try{
          const userId = req?.body?.id
          const limit = req?.body?.limit || 10;
          const page = req?.body?.page || 1;
          const offset = (page-1) * limit; 
          const query = {
              include:[{
                 model:Plan,
                 as:"Plan",
                 required:false
              }],
              order:[['created_at','desc']],
              where:{},
              limit:limit,
              offset:offset
          }
          query.where.user_id=userId
          const count = await Transaction.count({
            where:query.where,
            distinct: true
          })
          const findTransaction = await Transaction.findAll(query)
          if (findTransaction) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                data: findTransaction,
                data_count: count,
                page: page
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: findTransaction,
                data_count: count,
                page: page
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

exports.wallet = async(req,res)=>{
    try{
          const userId = req?.body?.id
          const query = {
              where:{},
          }
          query.where.user_id=userId
          const findWallet = await Wallet.findAll(query)
          if (findWallet) {
            res.status(200).json({
                messsage: "data found",
                status: true,
                status_code: 200,
                data: findWallet,
            })
        } else {
            res.status(200).json({
                messsage: "no data found",
                status: true,
                status_code: 200,
                data: findWallet,
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

exports.walletFreeze = async(req,res)=>{
    try{
        const walletId = req?.body?.id
        const walletData = await Wallet.findByPk(walletId)
        const updateWallet = await walletData.update({
            account_frize:!walletData?.account_frize
        })
        if(updateWallet){
            res.status(200).json({
                messsage: "update successfully",
                status: true,
                status_code: 200,
            })
        }else{
            res.status(400).json({
                messsage: "update failed",
                status: false,
                status_code: 400,
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


exports.credit = async(req,res)=>{
    try{
        const payload = req?.body
        const findTransaction = await Transaction.findOne({
            where:{
                id:payload?.transaction_id,
                user_id:payload?.user_id
            }
        })
        const credit = findTransaction?.total_credit
        const WalletDetails = await Wallet.findOne({
            where:{
                id:payload?.id,
                user_id:payload?.user_id
            }
        })
        const newBalance = WalletDetails?.balance + credit;
        const update = await Wallet?.update({
            balance:newBalance
        },{
            where:{
                id:payload?.id,
                user_id:payload?.user_id
            }
        })
        if(update){
            const update = await Transaction.update({
                transaction_success:"success"
            },{where:{
                id:payload?.transaction_id,
                user_id:payload?.user_id
            }})
            res.status(200).json({
                messsage: "update successfully",
                status: true,
                status_code: 200,
            })
        }else{
            res.status(400).json({
                messsage: "update failed",
                status: false,
                status_code: 400,
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


exports.userVideo = async (req,res) =>{
    try{
        const entity = req?.params?.entity || "image_video";
        const limit = parseInt(req?.params?.limit) || 10;
        const page = parseInt(req?.params?.page) || 1;
        const userId = req?.params?.user_id
        const baseAiUrl = process?.env?.BASE_AI_URL
        const offset = (page-1)*limit
        const query = {
            where:{},
            limit:limit,
            offset:offset,
            attributes:["id", "user_id", "video", "video_type", "thumbnail","title","description", "converted_video", "is_active", "created_at", "updated_at"],
            order:[['created_at','desc']]
        }
        query.where.video_type = entity
        query.where.user_id = userId
        const count = await Video.count({
            where:query.where,
            distint:true
        })
        const totalPage = Math.ceil(count/limit)
        const allVideo  = await Video.findAll(query)
        if(allVideo){
            res.status(200).json({
                baseUrl:baseAiUrl,
                messsage: "data found",
                status: true,
                status_code: 200,
                total_page:totalPage,
                data: allVideo,
                data_count: count,
                page: page
            })
        }else{
            res.status(200).json({
                baseUrl:baseAiUrl,
                messsage: "data found",
                status: true,
                status_code: 200,
                total_page:totalPage,
                data: allVideo,
                data_count: count,
                page: page
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

exports.videoStatus = async(req,res)=>{
    try{
        const VideoDetails = Video.findByPk(req?.body?.id)
        if(VideoDetails){
               const update = VideoDetails.update({
                   is_active:!VideoDetails?.is_active
               })
               if(update){
                    res.status(200).json({
                        messsage: "updated",
                        status: true,
                        status_code: 200,
                    })
               }else{
                res.status(400).json({
                    messsage: "updation failed",
                    status: false,
                    status_code: 400,
                })
               }
        }else{
            res.status(422).json({
                messsage: "no video data found",
                status: false,
                status_code: 422,
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