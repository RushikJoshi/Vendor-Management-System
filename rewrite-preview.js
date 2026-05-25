const fs = require('fs');

let content = fs.readFileSync('client/src/pages/admin/ProcurementSettings.jsx', 'utf8');

const startTag = '<div className="p-10 text-[11px] text-black leading-tight relative z-10">';
const endTag = '                             </div>\n                             <div className="mt-8 flex items-center justify-between';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end index.");
    process.exit(1);
}

const replacement =                           <div className="p-10 text-[11px] text-black leading-tight relative z-10">
                             <div className="flex flex-col gap-0 border-black">
                                 {/* HEADER */}
                                 <div className="flex justify-between items-start border-b border-black pb-2">
                                     <div className="text-[10px] space-y-0.5 font-normal uppercase text-slate-700">
                                         <h1 className="font-bold text-lg mb-2 text-black">{settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED'}</h1>
                                         {settings.companyAddress ? (
                                             settings.companyAddress.split('\n').map((line, index) => (
                                                 <p key={index}>{line}</p>
                                             ))
                                         ) : (
                                             <>
                                                 <p>OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,</p>
                                                 <p>OFF C.G. ROAD, AMBAWADI,</p>
                                                 <p>AHMEDABAD GJ 380006</p>
                                             </>
                                         )}
                                         <p className="text-indigo-600 normal-case">www.gitakshmi.com</p>
                                     </div>
                                     <div className="text-right flex flex-col items-end">
                                         {settings.logo ? (
                                             <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain" />
                                         ) : (
                                             <img src="/logo.png" alt="Logo" className="h-16" onError={(e) => e.target.style.display='none'} />
                                         )}
                                     </div>
                                 </div>
                                 <div className="relative flex justify-center items-center py-1 mt-2 mb-1 px-4">
                                     <div className="font-bold uppercase text-[11px] tracking-widest text-slate-800">
                                         {activeTemplate === "SO" ? "Service Order" : "Purchase Order"}
                                     </div>
                                     <span className="absolute right-4 text-[10px] font-black text-slate-800 tracking-wider uppercase">
                                         Original
                                     </span>
                                 </div>

                                 {/* INFO GRID */}
                                 <div className="flex border-x border-t border-b border-black mt-2">
                                     <div className="flex-1 border-r border-black p-2 min-h-[120px]">
                                         <div className="grid grid-cols-6 gap-y-1 text-[10px]">
                                             <span className="col-span-1 font-bold uppercase">Supplier</span><span className="col-span-5 font-bold text-indigo-900">: [SUPPLIER NAME PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Address</span><span className="col-span-5 uppercase">: [ADDRESS PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">City</span><span className="col-span-2 uppercase">: [CITY PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">PAN</span><span className="col-span-2 uppercase">: [PAN PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Contact</span><span className="col-span-2 uppercase">: [CONTACT PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Contact No</span><span className="col-span-2">: [PHONE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">State</span><span className="col-span-2 uppercase">: [STATE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">GST</span><span className="col-span-2 uppercase">: [GST PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Pincode</span><span className="col-span-2 uppercase">: [PINCODE PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">MSME Status</span><span className="col-span-2 uppercase">: [MSME PLACEHOLDER]</span>
                                             <span className="col-span-1 font-bold uppercase">Email</span><span className="col-span-5 uppercase break-all">: [EMAIL PLACEHOLDER]</span>
                                         </div>
                                     </div>
                                     <div className="w-[25%] shrink-0 p-2 text-[10px]">
                                         <div className="grid grid-cols-5 gap-y-1">
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order No</span><span className="col-span-3 font-bold">: {settings.poPrefix || "PO"}-1234</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order Date</span><span className="col-span-3">: [DATE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote No</span><span className="col-span-3 uppercase">: By Mail</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote Date</span><span className="col-span-3">: [DATE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Vendor Code</span><span className="col-span-3 uppercase">: [CODE]</span>
                                             <span className="col-span-2 font-bold uppercase whitespace-nowrap">Project Ref</span><span className="col-span-3">: -</span>
                                         </div>
                                     </div>
                                 </div>

                                 {/* ITEMS GRID */}
                                 <div className="border-x border-b border-black flex flex-col min-h-[200px]">
                                     <table className="w-full text-[9px] uppercase table-fixed border-collapse">
                                         <thead>
                                             <tr className="font-bold text-[10px] uppercase border-b border-black">
                                                 <th className="border-r border-black p-1.5 w-[6%] text-center align-middle">Sl No</th>
                                                 <th className="border-r border-black p-1.5 px-2 text-left align-middle">Description</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[12%] align-middle">HSN / SAC</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[10%] align-middle">UOM</th>
                                                 <th className="border-r border-black p-1.5 text-center w-[12%] align-middle">QTY</th>
                                                 <th className="border-r border-black p-1.5 text-right w-[12%] px-2 align-middle">Unit Price</th>
                                                 <th className="p-1.5 text-right w-[13%] px-2 align-middle">Amount</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             <tr className="min-h-[150px] text-[10px]">
                                                 <td className="border-r border-black p-2 text-center align-middle font-bold">1</td>
                                                 <td className="border-r border-black p-2 align-middle px-2">
                                                     <div className="flex flex-col gap-[1px]">
                                                         <div className="font-bold text-[11px] text-slate-900 leading-tight">[ITEM NAME PLACEHOLDER 1]</div>
                                                         <div className="text-[8.5px] text-slate-500 font-medium leading-tight">[ITEM SPECIFICATIONS AND DETAILS PLACEHOLDER]</div>
                                                     </div>
                                                 </td>
                                                 <td className="border-r border-black p-2 text-center align-middle">[HSN]</td>
                                                 <td className="border-r border-black p-2 text-center align-middle">[UOM]</td>
                                                 <td className="border-r border-black p-2 text-center align-middle">[QTY]</td>
                                                 <td className="border-r border-black p-2 text-right px-2 align-middle">[UNIT PRICE]</td>
                                                 <td className="p-2 text-right px-2 align-middle">[TOTAL AMOUNT]</td>
                                             </tr>
                                         </tbody>
                                     </table>
                                     <div className="flex-1 flex items-end">
                                         <div className="w-full">
                                             <div className="grid grid-cols-2 text-[10px] border-t border-black">
                                                 <div className="border-r border-black p-2 leading-relaxed">
                                                     <div className="flex gap-4"><span className="font-bold uppercase w-24">CIN</span><span>: {settings.cinNumber || '---'}</span></div>
                                                     <div className="flex gap-4"><span className="font-bold uppercase w-24">GST NO</span><span>: {settings.gstNumber || '---'}</span></div>
                                                     <div className="flex gap-4"><span className="font-bold uppercase w-24">JURISDICTION</span><span>: {settings.jurisdiction || '---'}</span></div>
                                                 </div>
                                                 <div className="p-2">
                                                     <div className="flex justify-between font-bold"><span className="uppercase">Basic Price :</span><span>[SUBTOTAL]</span></div>
                                                     <div className="flex justify-between font-bold"><span className="uppercase">Add: Input CGST 9% :</span><span>[CGST AMOUNT]</span></div>
                                                     <div className="flex justify-between font-bold"><span className="uppercase">Add: Input SGST 9% :</span><span>[SGST AMOUNT]</span></div>
                                                     <div className="flex justify-between font-black mt-1"><span className="uppercase">Grand Total :</span><span>[GRAND TOTAL]</span></div>
                                                 </div>
                                             </div>
                                             <div className="p-2 border-t border-black text-[10px]">
                                                 <span className="font-bold uppercase">In words: </span>
                                                 <span>**** INR [AMOUNT IN WORDS PLACEHOLDER] ONLY</span>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
                                     <div className="border-r border-black p-2"><div className="font-bold uppercase mb-1">Billing Address</div><div className="uppercase leading-tight text-slate-700">{settings.billingAddress}</div></div>
                                     <div className="p-2"><div className="font-bold uppercase mb-1">Delivery Address</div><div className="uppercase leading-tight text-slate-700">{settings.deliveryAddress}</div></div>
                                 </div>
                                 
                                 <div className="border-x border-b border-black overflow-hidden text-[11px]">
                                     <table className="w-full text-left border-collapse table-fixed">
                                         <thead>
                                             <tr className="font-bold text-[10px] uppercase border-b border-black bg-slate-200">
                                                 <th className="border-r border-black p-1.5 text-center whitespace-nowrap text-[11px]" style={{ width: '6%' }}>Sr No</th>
                                                 <th className="border-r border-black p-1.5 px-2 text-[11px]" style={{ width: '31.5%' }}>Term</th>
                                                 <th className="p-1.5 px-2 text-[11px]" style={{ width: '62.5%' }}>Description</th>
                                             </tr>
                                         </thead>
                                         <tbody className="uppercase">
                                             {(activeTemplate === "SO" ? (settings.soTerms || []) : (settings.poTerms || [])).map((t, i) => (
                                                 <tr key={i}>
                                                     <td className="py-0.5 text-center font-bold align-middle text-[12px]">{i + 1}</td>
                                                     <td className="py-0.5 px-2 font-normal align-middle text-[12px]">{t.term || '---'}</td>
                                                     <td className="py-0.5 px-2 align-middle text-[12px]">: {t.desc || '---'}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>

                                 <div className="border-x border-b border-black p-2 text-[11px]">
                                     <div className="font-bold uppercase mb-1">Remarks:</div>
                                     <div className="italic leading-tight whitespace-pre-wrap">{settings.remarks}</div>
                                 </div>

                                 {/* STAMP & SIGNATURE PREVIEW */}
                                 <div className="border-x border-b border-black p-2 min-h-[140px] flex flex-col justify-end text-[10px]">
                                      <div className="text-right flex flex-col items-end">
                                           <div className="mb-10 font-bold">For, {settings.companyName || 'GITAKSHMI TECHNOLOGIES PRIVATE LIMITED'}</div>
                                           <div className="font-bold">Authorized Signatory</div>
                                      </div>
                                 </div>
                             </div>
;

let newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync('client/src/pages/admin/ProcurementSettings.jsx', newContent);
