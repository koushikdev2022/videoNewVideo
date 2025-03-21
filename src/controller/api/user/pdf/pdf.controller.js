const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");



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
        const uniqueImages = new Set();

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);
            const ops = await page.getOperatorList();

            ops.fnArray.forEach((fn, index) => {
                if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
                    const imageKey = ops.argsArray[index]?.[0]; // Extract image object name
                    const imageProps = ops.argsArray[index]?.[1] || {}; // Ensure it's an object

                    if (imageKey) {
                        // Ensure width & height exist, and filter very small images
                        if (
                            typeof imageProps.width === "number" &&
                            typeof imageProps.height === "number" &&
                            imageProps.width > 30 &&
                            imageProps.height > 30
                        ) {
                            uniqueImages.add(imageKey);
                        } else {
                            uniqueImages.add(imageKey); // Fallback: count if properties are missing
                        }
                    }
                }
            });
        }

        res.status(200).json({
            status: true,
            pageCount,
            imageCount: uniqueImages.size, // Count only unique real images
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