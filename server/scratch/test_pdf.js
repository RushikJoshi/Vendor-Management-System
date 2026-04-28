const { generatePO } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

const testData = {
    poNumber: 'TEST-11000103',
    vendorName: 'AEGIS INFOWARE LIMITED',
    vendorAddress: 'B-607, MONDEAL SQUARE, OPP. HONEST RESTAURANT, S.G.HIGHWAY, Ahmedabad, Gujarat, 380015',
    vendorCity: 'Ahmedabad',
    vendorPAN: 'AAFCA7944P',
    vendorGST: '24AAFCA7944P1Z5',
    vendorPhone: '+91-9998678717',
    vendorEmail: 'd.barot@aegisinfoware.com',
    vendorContactPerson: 'Mr. Darshit Barot',
    vendorCode: '16000112',
    items: [
        {
            name: 'DELL INSPIRON 5440\nCore I3 100U | 8GB DDR5 | 512GB | 14"FHD | UBN | Ice Blue | 1YR NBD | Bag | No Lan Port',
            quantity: 1,
            unitPrice: 38000.00,
            totalPrice: 38000.00,
            hsn: '847130',
            uom: 'Nos'
        }
    ],
    totalAmount: 38000.00,
    totalAmountInWords: 'Forty Four Thousand Eight Hundred Forty Rupees Only'
};

const settings = {
    companyName: 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED',
    companyAddress: 'OFFICE NO.701, 7TH FLOOR,\nKAIVANNA COMPLEX, OFF C.G. ROAD,\nAMBAWADI, AHMEDABAD GJ 380006',
    companyWebsite: 'www.gitakshmi.com',
    cin: 'U72900GJ2019PTC110363',
    gstNumber: '24AAICG0391B1Z2',
    jurisdiction: 'MUNDRA',
    billingAddress: 'CORP. OFFICE\nOFFICE NO.701, 7TH FLOOR,\nKAIVANNA COMPLEX, OFF C.G. ROAD\nAMBAWADI, AHMEDABAD GJ 380006',
    deliveryAddress: 'CORP. OFFICE\nOFFICE NO.701, 7TH FLOOR,\nKAIVANNA COMPLEX, OFF C.G. ROAD\nAMBAWADI, AHMEDABAD GJ 380006'
};

async function test() {
    try {
        const url = await generatePO(testData, settings);
        console.log('PDF Generated successfully at:', url);
        process.exit(0);
    } catch (err) {
        console.error('PDF Generation failed:', err);
        process.exit(1);
    }
}

test();
