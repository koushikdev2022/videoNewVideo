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
        let imageCount = 0;

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdfDoc.getPage(i);
            const ops = await page.getOperatorList();
            const resourceDict = await page.getResources();

            // Find all XObject keys (potential images)
            if (resourceDict && resourceDict["XObject"]) {
                const xObjects = resourceDict["XObject"];

                for (const key in xObjects) {
                    const obj = xObjects[key];
                    if (obj && obj.subtype === "Image") {
                        imageCount++;
                    }
                }
            }
        }

        res.status(200).json({
            status: true,
            pageCount,
            imageCount,
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