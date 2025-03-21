const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");

const crypto = require("crypto");

exports.pageCount = async(req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).json({status:false, error: "No file uploaded",status_code:400  });
        }
        // const data = await pdfParse(req.file.buffer);
        // res.status(200).json({status:true, pageCount: data.numpages,status_code:200 });  

        // const pdfDoc = await PDFDocument.load(req.file.buffer);
        // const pageCount = pdfDoc.getPageCount();

    
        // const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // const pdfData = new Uint8Array(req.file.buffer);
        // const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

        // const pageCount = pdfDoc.numPages;
        // let imageCount = 0;

        // for (let i = 1; i <= pageCount; i++) {
        //     const page = await pdfDoc.getPage(i);
        //     const ops = await page.getOperatorList();

        //     // Count image drawing operations
        //     ops.fnArray.forEach((fn) => {
        //         if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
        //             imageCount++;
        //         }
        //     });
        // }
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        const pdfData = new Uint8Array(req.file.buffer);
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

        const pageCount = pdfDoc.numPages;
        const uniqueImages = new Set(); // Track unique images

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);
            const ops = await page.getOperatorList(); // Use operator list instead of getResources

            ops.fnArray.forEach((fn, index) => {
                if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
                    const imageKey = ops.argsArray[index]?.[0]; // Extract image object name

                    if (imageKey) {
                        // FILTER: Ignore duplicate images using a hash
                        const hash = crypto.createHash("md5").update(imageKey).digest("hex");
                        uniqueImages.add(hash);
                    }
                }
            });
        }

        res.status(200).json({
            status: true,
            pageCount,
            imageCount: uniqueImages.size, 
            status_code: 200,
        });
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