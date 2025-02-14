const { User,Video } = require("../../../../models")



exports.featureVideo = async (req,res) =>{
    try{
          const limit = req?.body?.limit || 10
          const page = req?.body?.page || 1
          const offset = (page - 1)*limit
          const baseAiUrl = process?.env?.BASE_AI_URL
          const video = await Video.findAll({
            where:{
                is_feature:1
            },
            order:[['id','desc']],
            limit:limit,
            offset:offset
          })
          const count = await Video.count({
            where:{
                is_feature:1
            },
            distinct: true
          })
          const totalPage = Math.ceil(count/limit)
          if(video){
            res.status(200).json({
                baseUrl:baseAiUrl,
                messsage: "data found",
                status: true,
                status_code: 200,
                total_page:totalPage,
                data: video,
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
                data: video,
                data_count: count,
                page: page
            })
          }
    }catch (err) {
        console.log("Error in sendMail in forgetPasswordController: ", err);
        const status = err?.status || 400;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            msg,
            status: false,
            status_code: status
        })
    }
}