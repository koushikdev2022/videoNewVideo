
const {Video} = require("../../../../models")

exports.list = async (req,res) =>{
    try{
        const entity = req?.params?.entity || "image_video";
        const limit = req?.params?.limit || 10;
        const page = req?.params?.page || 1;
        const userId = req?.user?.id
        const baseAiUrl = process?.env?.BASE_AI_URL
        const offset = (page-1)*limit
        const query = {
            where:{},
            limit:limit,
            offset:offset,
            order:[['created_at','desc']]
        }
        query.where.video_type = entity
        query.where.is_active = 1
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


exports.create = async (req,res)=>{
    try{
        const payload = req?.body
        const userId = req?.user?.id
        const video = await Video.create({
                user_id:userId,
                video:payload?.video,
                video_type:payload?.video_type,
                thumbnail:payload?.thumbnail,
                converted_video:payload?.converted_video,
                is_active:payload?.is_active
        })
        if(video){
            res.status(201).json({
                messsage:"create successfully",
                status:true,
                status_code:201,
            })
        }else{
            res.status(400).json({
                messsage:"create false",
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