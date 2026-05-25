const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

exports.generatePO = async (poData, settings = {}) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
        const filename = `PO-${poData.poNumber}.pdf`;
        const filePath = path.join(__dirname, '../uploads/po', filename);

        const dir = path.join(__dirname, '../uploads/po');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Helper: Draw a horizontal line
        const line = (y) => doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();
        
        // Helper: Draw a vertical line
        const vLine = (x, y1, y2) => doc.moveTo(x, y1).lineTo(x, y2).stroke();

        // --- HEADER ---
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#000');
        doc.text(settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED', MARGIN, MARGIN);
        doc.font('Helvetica').fontSize(9);
        doc.text(settings.companyAddress || 'OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,\nOFF C.G. ROAD, AMBAWADI,\nAHMEDABAD GJ 380006', MARGIN, MARGIN + 18);
        doc.text(settings.companyWebsite || 'www.gitakshmi.com', MARGIN, MARGIN + 55);

        // Logo (Top Right)
        const logoPath = path.join(__dirname, '../../client/public/hgiel_logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, PAGE_WIDTH - MARGIN - 150, MARGIN, { width: 150 });
        }

        let currentY = MARGIN + 80;

        // TITLE
        const docTitle = poData.orderType === 'SO' ? 'SERVICE ORDER' : 'PURCHASE ORDER';
        doc.rect(MARGIN, currentY, CONTENT_WIDTH, 15).fill('#f8fafc').stroke();
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
        doc.text(docTitle, MARGIN, currentY + 3, { align: 'center', width: CONTENT_WIDTH });
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b');
        doc.text('ORIGINAL', PAGE_WIDTH - MARGIN - 60, currentY + 4, { align: 'right', width: 50 });
        doc.fillColor('#000');
        currentY += 15;

        // INFO GRID
        const gridTop = currentY;
        const col1 = MARGIN;
        const col2 = MARGIN + 250;
        const col3 = MARGIN + 335;
        const rowH = 16; // Increased row height for better clarity

        doc.fontSize(8).font('Helvetica');
        
        // Row 1: Supplier / PAN / Order No
        const orderNoLabel = poData.orderType === 'SO' ? 'Service Order No' : 'Order No';
        doc.font('Helvetica-Bold').text('Supplier', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorName || 'N/A'}`, col1 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text(orderNoLabel, col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.poNumber}`, col3 + 80, currentY + 4);
        currentY += rowH;
        line(currentY);

        // Row 2: Address / Order Date
        doc.font('Helvetica-Bold').text('Address', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorAddress || 'N/A'}`, col1 + 60, currentY + 4, { width: 280 });
        doc.font('Helvetica-Bold').text('Order Date', col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${new Date().toLocaleDateString('en-GB')}`, col3 + 80, currentY + 4);
        currentY += rowH * 2;
        line(currentY);

        // Row 3: City / PAN / Quote No
        doc.font('Helvetica-Bold').text('City', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorCity || 'N/A'}`, col1 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('PAN', col2 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorPAN || 'N/A'}`, col2 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('Quote No', col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.quoteNo || 'By Mail'}`, col3 + 80, currentY + 4);
        currentY += rowH;
        line(currentY);

        // Row 4: Contact / Contact No / Quote Date
        doc.font('Helvetica-Bold').text('Contact', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorContactPerson || 'N/A'}`, col1 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('Contact No', col2 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorPhone || 'N/A'}`, col2 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('Quote Date', col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.quoteDate || 'N/A'}`, col3 + 80, currentY + 4);
        currentY += rowH;
        line(currentY);

        // Row 5: State / GST / Vendor Code
        doc.font('Helvetica-Bold').text('State Name', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorState || 'N/A'}`, col1 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('GST', col2 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorGST || 'N/A'}`, col2 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('Vendor Code', col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorCode || 'N/A'}`, col3 + 80, currentY + 4);
        currentY += rowH;
        line(currentY);

        // Row 6: Pincode / MSME Status / Contact
        doc.font('Helvetica-Bold').text('Pincode', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorPincode || 'N/A'}`, col1 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('MSME Status', col2 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorMSME || 'N/A'}`, col2 + 60, currentY + 4);
        doc.font('Helvetica-Bold').text('Contact', col3 + 2, currentY + 4);
        doc.font('Helvetica').text(`: -`, col3 + 80, currentY + 4);
        currentY += rowH;
        line(currentY);

        // Row 7: Email
        doc.font('Helvetica-Bold').text('Email', col1 + 2, currentY + 4);
        doc.font('Helvetica').text(`: ${poData.vendorEmail || 'N/A'}`, col1 + 60, currentY + 4, { width: 280 });
        currentY += rowH;
        doc.moveTo(MARGIN, currentY).lineTo(col3, currentY).stroke();

        // Vertical lines for the grid
        vLine(MARGIN, gridTop, currentY);
        vLine(col2, gridTop + rowH * 3, currentY - rowH);
        vLine(col3, gridTop, currentY);
        vLine(PAGE_WIDTH - MARGIN, gridTop, currentY - rowH);

        // --- ITEMS TABLE ---
        currentY += 5;
        const tblTop = currentY;
        const tblCols = [30, 175, 60, 40, 30, 110, 110]; // SlNo, Desc, HSN, UOM, QTY, Price, Amount
        let x = MARGIN;
        const headers = ['Sl No', 'Description', 'HSN / SAC', 'UOM', 'QTY', 'Unit Price', 'Amount'];
        
        doc.font('Helvetica-Bold').fontSize(8);
        headers.forEach((h, i) => {
            doc.rect(x, currentY, tblCols[i], 20).stroke();
            doc.text(h, x, currentY + 6, { width: tblCols[i], align: 'center' });
            x += tblCols[i];
        });
        currentY += 20;

        doc.font('Helvetica').fontSize(8);
        const rowStart = currentY;
        (poData.items || []).forEach((item, idx) => {
            let x = MARGIN;
            const itemRowH = 40; // Fixed height for simplicity or use dynamic
            
            doc.text(idx + 1, x, currentY + 5, { width: tblCols[0], align: 'center' });
            x += tblCols[0];
            doc.font('Helvetica-Bold').fontSize(8.5);
            doc.text(item.name || 'N/A', x + 5, currentY + 5, { width: tblCols[1] - 10 });
            if (item.specifications) {
                doc.font('Helvetica').fontSize(6.5).fillColor('#64748b');
                doc.text(item.specifications, x + 5, currentY + 16, { width: tblCols[1] - 10 });
                doc.fillColor('#000000'); // reset
            }
            x += tblCols[1];
            doc.text(item.hsn || '847130', x, currentY + 5, { width: tblCols[2], align: 'center' });
            x += tblCols[2];
            doc.text(item.uom || 'Nos', x, currentY + 5, { width: tblCols[3], align: 'center' });
            x += tblCols[3];
            doc.text(item.quantity || 1, x, currentY + 5, { width: tblCols[4], align: 'center' });
            x += tblCols[4];
            doc.text(`\u20B9 ${item.unitPrice?.toLocaleString()}`, x, currentY + 5, { width: tblCols[5], align: 'center' });
            x += tblCols[5];
            doc.text(`\u20B9 ${item.totalPrice?.toLocaleString()}`, x, currentY + 5, { width: tblCols[6], align: 'center' });
            
            currentY += itemRowH;
        });

        // Vertical lines for table rows
        const tblBottom = 600; // Fixed height for items area to match sample
        x = MARGIN;
        tblCols.forEach(w => {
            vLine(x, rowStart, tblBottom);
            x += w;
        });
        vLine(PAGE_WIDTH - MARGIN, rowStart, tblBottom);
        line(tblBottom);

        currentY = tblBottom;

        // --- SUMMARY ---
        doc.fontSize(8);
        const sumLeft = MARGIN;
        const sumRight = MARGIN + 350;

        // CIN / Basic Price
        doc.font('Helvetica-Bold').text('CIN', sumLeft + 2, currentY + 3);
        doc.font('Helvetica').text(`: ${settings.cin || 'U72900GJ2019PTC110363'}`, sumLeft + 60, currentY + 3);
        doc.font('Helvetica').text('Basic Price', sumRight + 2, currentY + 3);
        doc.text(`: \u20B9 ${(poData.totalAmount || 0).toLocaleString()}`, sumRight + 80, currentY + 3, { align: 'right', width: 80 });
        currentY += 12;
        line(currentY);

        // GST NO / Tax
        doc.font('Helvetica-Bold').text('GST NO', sumLeft + 2, currentY + 3);
        doc.font('Helvetica').text(`: ${settings.gstNumber || '24AAICG0391B1Z2'}`, sumLeft + 60, currentY + 3);
        doc.font('Helvetica').text('Input - CGST+ IGST 18%', sumRight + 2, currentY + 3);
        doc.text(`: \u20B9 ${(poData.totalAmount * 0.18).toLocaleString()}`, sumRight + 80, currentY + 3, { align: 'right', width: 80 });
        currentY += 12;
        line(currentY);

        // JURIDICTION / Grand Total
        doc.font('Helvetica-Bold').text('JURIDICTION', sumLeft + 2, currentY + 3);
        doc.font('Helvetica').text(`: ${settings.jurisdiction || 'MUNDRA'}`, sumLeft + 60, currentY + 3);
        doc.font('Helvetica-Bold').text('Grand Total', sumRight + 2, currentY + 3);
        doc.text(`: \u20B9 ${(poData.totalAmount * 1.18).toLocaleString()}`, sumRight + 80, currentY + 3, { align: 'right', width: 80 });
        currentY += 12;
        line(currentY);

        // In Words
        doc.font('Helvetica-Bold').text('In words', sumLeft + 2, currentY + 3);
        doc.font('Helvetica').text(`: ****INR ${poData.totalAmountInWords || 'Forty Four Thousand Eight Hundred Forty Rupees Only'}`, sumLeft + 60, currentY + 3);
        currentY += 15;
        line(currentY);

        const addressCol = MARGIN + 347;
        doc.font('Helvetica-Bold').text('Billing Address', MARGIN + 2, currentY + 3);
        doc.text('Delivery Address', addressCol + 2, currentY + 3);
        currentY += 12;
        line(currentY);
        
        doc.font('Helvetica').fontSize(7);
        doc.text(settings.billingAddress || 'OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,\nOFF C.G. ROAD, AMBAWADI,\nAHMEDABAD GJ 380006', MARGIN + 2, currentY + 5, { width: addressCol - MARGIN - 4 });
        doc.text(settings.deliveryAddress || 'OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,\nOFF C.G. ROAD, AMBAWADI,\nAHMEDABAD GJ 380006', addressCol + 2, currentY + 5, { width: PAGE_WIDTH - MARGIN - addressCol - 4 });
        currentY += 32;
        line(currentY);

        // Indent No
        doc.font('Helvetica-Bold').fontSize(8).text('Indent No:', MARGIN + 2, currentY + 3);
        currentY += 12;
        line(currentY);

        // Payment / Credit / Delivery
        doc.text('Payment Term', MARGIN + 2, currentY + 3, { width: 160 });
        doc.text('Credit', MARGIN + 172, currentY + 3, { width: 160 });
        doc.text('Delivery Details', col3 + 2, currentY + 3, { width: 200 });
        currentY += 12;
        line(currentY);
        doc.font('Helvetica').text('AFTER DELIVERY', MARGIN + 2, currentY + 3, { width: 160 });
        doc.text('WITHIN 30 DAYS', MARGIN + 172, currentY + 3, { width: 160 });
        doc.text('IMMEDIATE', col3 + 2, currentY + 3, { width: 200 });
        currentY += 12;
        line(currentY);

        // Vertical lines for the bottom grid
        vLine(MARGIN, sumLeft + 36, currentY);
        vLine(addressCol, currentY - 69, currentY);
        vLine(MARGIN + 167, currentY - 24, currentY);
        vLine(col3, currentY - 24, currentY);
        vLine(PAGE_WIDTH - MARGIN, sumLeft + 36, currentY);

        // Terms Table Header
        doc.font('Helvetica-Bold').text('Sr. No', MARGIN + 2, currentY + 3);
        doc.text('Term', MARGIN + 30, currentY + 3);
        doc.text('Description', col2 + 4, currentY + 3);
        currentY += 12;
        line(currentY);

        const terms = [
            { term: 'AGAINST FORM NO', desc: 'NOT APPLICABLE' },
            { term: 'TEST CERTIFICATE', desc: 'REQUIRED' },
            { term: 'TRANSPORTATION', desc: 'Included' },
            { term: 'BRAND / SUPPORT / WARRANTY', desc: 'SONY/ Yes / As and when Required' }
        ];

        terms.forEach((t, i) => {
            doc.font('Helvetica').text(i + 1, MARGIN + 2, currentY + 3);
            doc.text(t.term, MARGIN + 30, currentY + 3);
            doc.text(`: ${t.desc}`, col2 + 4, currentY + 3);
            currentY += 12;
            line(currentY);
        });

        // Vertical lines for terms
        vLine(MARGIN, currentY - (12 * 5), currentY);
        vLine(MARGIN + 25, currentY - (12 * 5), currentY);
        vLine(col2, currentY - (12 * 5), currentY);
        vLine(PAGE_WIDTH - MARGIN, currentY - (12 * 5), currentY);

        // Remarks
        doc.font('Helvetica-Bold').text(`Remarks: `, MARGIN + 2, currentY + 3);
        doc.font('Helvetica').text('Please provide Serial Number in billing', MARGIN + 45, currentY + 3);
        currentY += 15;
        line(currentY);
        vLine(MARGIN, currentY - 15, currentY);
        vLine(PAGE_WIDTH - MARGIN, currentY - 15, currentY);

        // Footer
        currentY += 20;
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text(`for, ${poData.vendorId?.companyName || poData.vendorId?.name || 'HOTLINESYSTEM'}`, MARGIN, currentY, { align: 'left', width: 250 });
        doc.text(`for, ${settings.companyName || 'GITAKSHMI TECHNOLOGIES PVT. LTD.'}`, PAGE_WIDTH - MARGIN - 200, currentY, { align: 'right', width: 200 });
        
        // Digital signature/accepted text is printed below inside Signatures Row


        // Signatures Row
        currentY += 60;
        const acceptedText = `Accepted By${poData.status !== 'pending' && poData.status !== 'rejected' && poData.acceptedBy ? ': ' + poData.acceptedBy : ''}`;
        doc.text(acceptedText, MARGIN, currentY, { align: 'left', width: 250 });
        doc.text('Authorized signatory', PAGE_WIDTH - MARGIN - 200, currentY, { align: 'right', width: 200 });

        doc.fontSize(8).text('Page 1 of 2', 0, PAGE_HEIGHT - 30, { align: 'center', width: PAGE_WIDTH });

        // --- SECOND PAGE (Terms & Conditions) ---
        doc.addPage();
        doc.fontSize(10).font('Helvetica-Bold').text(settings.companyName || 'Gitakshmi Technologies Private Limited', MARGIN, MARGIN);
        doc.text(`${poData.orderType === 'SO' ? 'SO' : 'PO'} number/date           ${poData.poNumber} / ${new Date().toLocaleDateString('en-GB')}`, MARGIN + 300, MARGIN);
        line(MARGIN + 15);

        currentY = MARGIN + 30;
        doc.text('Special Terms & Conditions', MARGIN, currentY);
        currentY += 15;
        doc.font('Helvetica-Bold').text('VENDOR BANK DETAIL', MARGIN, currentY);
        doc.font('Helvetica').text(`: BANK NAME        : ${poData.bankName || 'HDFC BANK LIMITED'}    A/C No.: ${poData.accountNo || '07838640000120'}`, MARGIN + 120, currentY);
        currentY += 15;
        doc.font('Helvetica-Bold').text('Special Instructions', MARGIN, currentY);
        doc.font('Helvetica').text(`: Please send us your order acceptance immediately...`, MARGIN + 120, currentY, { width: 350 });
        
        currentY += 80;
        doc.font('Helvetica-Bold').text('GENERAL TERMS & CONDITIONS', MARGIN, currentY);
        currentY += 15;
        doc.font('Helvetica').fontSize(8).text(`Following are the General Terms & Conditions applicable to this ${poData.orderType === 'SO' ? 'SO' : 'PO'}. In case of contradictions, Terms & Conditions mentioned in the main body of the ${poData.orderType === 'SO' ? 'SO' : 'PO'} shall take precedence over Terms & Conditions mentioned here.`, MARGIN, currentY, { width: CONTENT_WIDTH });

        // Add dynamic Accepted By signature to Page 2
        currentY = PAGE_HEIGHT - 130;
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text(`for, ${poData.vendorId?.companyName || poData.vendorId?.name || 'HOTLINESYSTEM'}`, MARGIN, currentY, { align: 'left', width: 250 });
        
        // Digital signature/accepted text is printed below inside Signatures Bottom Row


        // Signatures Bottom Row
        currentY += 60;
        const acceptedText3 = `Accepted By${poData.status !== 'pending' && poData.status !== 'rejected' && poData.acceptedBy ? ': ' + poData.acceptedBy : ''}`;
        doc.text(acceptedText3, MARGIN, currentY, { align: 'left', width: 250 });

        doc.fontSize(8).text('Page 2 of 2', 0, PAGE_HEIGHT - 30, { align: 'center', width: PAGE_WIDTH });

        doc.end();
        stream.on('finish', () => resolve(`/uploads/po/${filename}`));
        stream.on('error', (err) => reject(err));
    });
};

exports.generateSO = async (soData, settings = {}) => {
    return exports.generatePO({ ...soData, poNumber: soData.soNumber, orderType: 'SO' }, { ...settings, titleType: 'SERVICE' });
};

