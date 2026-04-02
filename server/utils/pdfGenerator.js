const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePO = async (poData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filename = `PO-${poData.poNumber}.pdf`;
        const filePath = path.join(__dirname, '../uploads/po', filename);

        // Ensure directory exists
        const dir = path.join(__dirname, '../uploads/po');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Add content
        doc.fontSize(25).text('PURCHASE ORDER', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`PO Number: ${poData.poNumber}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text(`Vendor: ${poData.vendorName}`);
        doc.moveDown();

        // Table Header
        doc.fontSize(14).text('Items:', { underline: true });
        doc.moveDown(0.5);
        
        poData.items.forEach(item => {
            doc.fontSize(11).text(`${item.name} - ${item.quantity} x ${item.unitPrice} = ${item.totalPrice}`);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Amount: ${poData.totalAmount}`, { bold: true });

        doc.end();

        stream.on('finish', () => {
            resolve(`/uploads/po/${filename}`);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};
