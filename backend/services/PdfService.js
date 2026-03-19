const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class PdfService {
    static async generateVendorApplicationPDF(application) {
        return new Promise((resolve, reject) => {
            try {
                // Ensure directory exists
                const uploadsDir = path.join(__dirname, "../uploads/applications");
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                // File name & path
                const timestamp = Date.now();
                const fileName = `vendor_app_${application._id}_${timestamp}.pdf`;
                const filePath = path.join(uploadsDir, fileName);

                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);

                doc.pipe(stream);

                // --- Header ---
                doc.fontSize(20).font('Helvetica-Bold').text('VMS Enterprise', { align: 'center' });
                doc.fontSize(14).font('Helvetica').text('Vendor Registration Dossier', { align: 'center' });
                doc.moveDown();

                doc.fontSize(10).text(`Application ID: ${application._id}`);
                doc.text(`Submitted On: ${new Date(application.submittedAt || Date.now()).toLocaleString()}`);
                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();

                // --- Helper Method for Sections ---
                const addSection = (title) => {
                    doc.moveDown();
                    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F7B4D').text(title);
                    doc.moveDown(0.5);
                    doc.font('Helvetica').fillColor('black').fontSize(10);
                };

                const getVal = (key) => {
                    const data = application.data;
                    if (!data) return "N/A";
                    if (data instanceof Map) return data.get(key) || "N/A";
                    return data[key] || "N/A";
                };

                // --- 1. Company Information ---
                addSection('1. Company Information');
                doc.text(`Company Name: ${application.companyName || getVal('companyName') || getVal('co_name') || 'N/A'}`);
                doc.text(`Email: ${application.email || getVal('email') || getVal('co_email') || 'N/A'}`);
                doc.text(`Registered Address: ${getVal('address') || getVal('registeredAddress') || 'N/A'}`);
                doc.text(`City: ${getVal('city') || getVal('co_city') || 'N/A'}`);
                doc.text(`State: ${getVal('state') || getVal('co_state') || 'N/A'}`);
                doc.text(`Country: ${getVal('country') || getVal('co_country') || 'N/A'}`);
                doc.text(`Mobile: ${getVal('mobileNumber') || getVal('mobile') || getVal('co_mobile') || 'N/A'}`);
                doc.text(`Contact Person: ${getVal('contactName') || getVal('contactPerson') || 'N/A'}`);

                // --- 2. Business Details ---
                addSection('2. Business Details');
                doc.text(`Nature of Business: ${getVal('natureOfBusiness') || 'N/A'}`);
                doc.text(`Establishment Year: ${getVal('establishmentYear') || 'N/A'}`);
                doc.text(`Website: ${getVal('website') || 'N/A'}`);
                doc.text(`Employee Count: ${getVal('employeeCount') || 'N/A'}`);

                // --- 3. Statutory Details ---
                addSection('3. Statutory Details');
                doc.text(`PAN Number: ${getVal('panNum') || getVal('panNumber') || 'N/A'}`);
                doc.text(`GST Number: ${getVal('gstNum') || getVal('gstNumber') || 'N/A'}`);
                doc.text(`Registration Type: ${getVal('regType') || getVal('registrationType') || 'N/A'}`);
                doc.text(`MSME Info: ${getVal('msmeNum') || 'N/A'} - ${getVal('msmeCat') || 'N/A'}`);

                // --- 4. Bank Details ---
                addSection('4. Bank Details (NEFT/RTGS)');
                doc.text(`Beneficiary Name: ${getVal('beneficiaryName') || 'N/A'}`);
                doc.text(`Bank Name: ${getVal('bankName') || 'N/A'}`);
                doc.text(`Branch: ${getVal('bankBranch') || getVal('branchName') || 'N/A'}`);
                doc.text(`Account Number: ${getVal('accountNumber') || 'N/A'}`);
                doc.text(`IFSC Code: ${getVal('ifscCode') || 'N/A'}`);

                // --- 5. Uploaded Documents ---
                addSection('5. Uploaded Documents Overview');
                if (application.documents && application.documents.length > 0) {
                    application.documents.forEach((docItem, index) => {
                        doc.text(`${index + 1}. ${docItem.fieldName || 'Document'}: ${docItem.name}`);
                    });
                } else {
                    doc.text('No documents uploaded.');
                }

                doc.moveDown();
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();

                // Footer
                doc.fontSize(8).fillColor('gray').text('This is an automatically generated document from the VMS Enterprise System.', { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve(filePath);
                });

                stream.on('error', (err) => {
                    reject(err);
                });

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PdfService;
