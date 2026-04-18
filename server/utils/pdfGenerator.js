const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Conversion helper: 1 React Pixel (at 96 DPI) to 0.75 PDF Points (at 72 DPI)
const pxToPt = (px) => (px || 0) * 0.75;
const MARGIN = 50;

exports.generatePO = async (poData, settings = {}) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
        const themeColor = settings.themeColor || '#1e3a8a';
        const secondaryColor = settings.secondaryColor || '#64748b';
        const filename = `PO-${poData.poNumber}.pdf`;
        const filePath = path.join(__dirname, '../uploads/po', filename);

        const positions = settings.layoutPositions || {};

        const dir = path.join(__dirname, '../uploads/po');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Background Watermark
        if (settings.isWatermarkEnabled) {
            doc.save()
               .opacity(0.03)
               .fontSize(60)
               .fillColor('#000')
               .rotate(-30, { origin: [300, 400] })
               .text(`${settings.companyName || 'AUTHORIZED'}\nDOCUMENT`, 100, 300, { align: 'center', width: 400 })
               .restore();
        }

        // 1. Header Area
        const hPos = positions.header || { x: 0, y: 0 };
        const hX = MARGIN + pxToPt(hPos.x);
        const hY = MARGIN + pxToPt(hPos.y);
        
        doc.fillColor(themeColor).fontSize(20).text(settings.companyName || 'GLOBAL TECH ENTERPRISE', hX, hY, { bold: true });
        doc.strokeColor(themeColor).lineWidth(2).moveTo(hX, hY + 25).lineTo(hX + 500, hY + 25).stroke();

        // 2. Buyer Info
        const bPos = positions.buyerInfo || { x: 0, y: 180 };
        const bX = MARGIN + pxToPt(bPos.x);
        const bY = MARGIN + pxToPt(bPos.y);
        doc.fillColor(secondaryColor).fontSize(10).text('BUYER REGISTRATION', bX, bY, { characterSpacing: 1 });
        doc.fillColor('#334155').fontSize(11).text(settings.companyAddress || 'Office Location Address', bX, bY + 15, { width: 250 });
        doc.fillColor(themeColor).fontSize(10).text(`GSTIN: ${settings.gstNumber || 'N/A'}`, bX, bY + 45);

        // 3. Order Title/Meta
        const tPos = positions.orderTitle || { x: 450, y: 50 };
        const tX = MARGIN + pxToPt(tPos.x);
        const tY = MARGIN + pxToPt(tPos.y);
        doc.fillColor('#0f172a').fontSize(35).text('ORDER', tX - 100, tY, { align: 'right', width: 200 });
        doc.fillColor('#10b981').fontSize(10).text('CERTIFIED INSTRUMENT', tX - 100, tY + 40, { align: 'right', width: 200, characterSpacing: 2 });
        doc.fillColor('#475569').fontSize(10).text(`Ref: ${poData.poNumber}`, tX - 100, tY + 60, { align: 'right', width: 200 });

        // 4. Items Table
        const tblPos = positions.table || { x: 0, y: 400 };
        const tblX = MARGIN + pxToPt(tblPos.x);
        let tblY = MARGIN + pxToPt(tblPos.y);

        doc.fillColor(settings.tableHeaderColor || '#f8fafc').rect(tblX, tblY, 500, 25).fill();
        doc.fillColor('#64748b').fontSize(9).text('DESCRIPTION', tblX + 10, tblY + 8);
        doc.text('TOTAL VALUATION', tblX + 400, tblY + 8, { width: 90, align: 'right' });

        tblY += 35;
        (poData.items || []).forEach(item => {
            doc.fillColor('#1e293b').fontSize(11).text(String(item.name || 'Operational Component'), tblX + 10, tblY, { width: 350 });
            doc.fillColor(themeColor).fontSize(11).text(`₹ ${item.totalPrice.toLocaleString()}`, tblX + 400, tblY, { width: 90, align: 'right', bold: true });
            tblY += 30;
        });

        doc.fillColor('#f8fafc').rect(tblX, tblY, 500, 40).fill();
        doc.fillColor('#64748b').fontSize(9).text('GRANT TOTAL PAYABLE', tblX + 10, tblY + 15);
        doc.fillColor(themeColor).fontSize(18).text(`₹ ${(poData.totalAmount || 0).toLocaleString()}`, tblX + 300, tblY + 12, { width: 190, align: 'right', bold: true });

        // 5. Signatory
        const sPos = positions.signatory || { x: 450, y: 750 };
        const sX = MARGIN + pxToPt(sPos.x);
        const sY = MARGIN + pxToPt(sPos.y);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(sX - 150, sY).lineTo(sX, sY).stroke();
        doc.fillColor('#0f172a').fontSize(10).text(settings.authorizedSignatory?.name || 'Authorized Official', sX - 150, sY + 10, { align: 'right', width: 150, bold: true });
        doc.fillColor(themeColor).fontSize(8).text(`For ${settings.companyName || 'the Entity'}`, sX - 150, sY + 22, { align: 'right', width: 150 });

        doc.end();
        stream.on('finish', () => resolve(`/uploads/po/${filename}`));
        stream.on('error', (err) => reject(err));
    });
};

exports.generateSO = async (soData, settings = {}) => {
    // Service Order uses same logic but different title
    return exports.generatePO({ ...soData, poNumber: soData.soNumber }, { ...settings, titleType: 'SERVICE' });
};
