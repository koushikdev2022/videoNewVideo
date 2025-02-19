
const {Video} = require("../../../../models")


exports.update = async (req,res)=>{
    try{
        const videoId = req?.body?.video_id
        if(!videoId){
            res.status(422).json({
                status:false,
                status_code:422,
                message:"video_id is require"
            })
        }
        if(!req?.body?.title){
            res.status(422).json({
                status:false,
                status_code:422,
                message:"title is require"
            })
        }
        if(!req?.body?.description){
            res.status(422).json({
                status:false,
                status_code:422,
                message:"description is require"
            })
        }
        const update = await Video.update({
            title:req?.body?.title,
            description:req?.body?.description
        },{
            where:{
                id:videoId
            }
        })
        if(update){
            res.status(200).json({
                status:true,
                status_code:200,
                message:"update successfully"
            })
        }else{
            res.status(400).json({
                status:false,
                status_code:400,
                message:"updation failed"
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
function encodeUrl(url) {
    // Convert to Base64
    let base64 = Buffer.from(url).toString("base64");
    // Make it URL-safe by replacing +, /, and = with -, _, and empty string
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Function to decode the encoded URL
function decodeUrl(encodedUrl) {
    // Replace - and _ back to + and /
    let base64 = encodedUrl.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with `=` to make it Base64 valid
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }
    // Decode the Base64 string
    return Buffer.from(base64, "base64").toString("utf8");
}
exports.list = async (req,res) =>{
    try{
        const entity = req?.params?.entity || "image_video";
        const limit = parseInt(req?.params?.limit) || 10;
        const page = parseInt(req?.params?.page) || 1;
        const userId = req?.user?.id
        const baseAiUrl = process?.env?.BASE_AI_URL
        const encodedUrl = encodeUrl(baseAiUrl);
        const offset = (page-1)*limit
        const query = {
            where:{},
            limit:limit,
            offset:offset,
            attributes:["id", "user_id", "video", "video_type", "thumbnail","title","description", "converted_video", "is_active", "created_at", "updated_at"],
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
                encode:encodedUrl,
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
                title:payload?.title,
                description:payload?.description,
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