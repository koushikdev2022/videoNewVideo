const pdfParse = require("pdf-parse");

exports.pageCount = async(req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).json({status:false, error: "No file uploaded",status_code:400  });
        }
        const data = await pdfParse(req.file.buffer);
        res.status(200).json({status:true, pageCount: data.numpages,status_code:200 });  
    } catch (err) {
        console.error("Error in register function: ", err);
        const status = err?.status || 500;
        const msg = err?.message || "Internal Server Error";
        return res.status(status).json({
            status: false,
            message: msg,
            status_code: status,
        });
    }
}