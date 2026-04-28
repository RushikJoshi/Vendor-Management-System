import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { ProcurementContext } from "../../context/ProcurementContext";
import api from "../../services/api";

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, serviceOrders, refreshAll, loading } = useContext(ProcurementContext);
  const [docSettings, setDocSettings] = useState(null);
  const [po, setPo] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    refreshAll();
    api.get("/procurement-settings").then(res => {
      const data = res.data.data;
      setDocSettings(data?.PO || data || {});
    }).catch(console.error);
  }, [refreshAll, id]);

  useEffect(() => {
    const allOrders = [...(purchaseOrders || []), ...(serviceOrders || [])];
    if (allOrders.length > 0) {
      const found = allOrders.find(p => p._id === id);
      setPo(found);
    }
  }, [purchaseOrders, serviceOrders, id]);

  const handlePrint = () => {
    window.print();
  };

  if (!po && !loading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 uppercase tracking-widest text-xs font-bold text-rose-500">
      Document Not Found
    </div>
  );

  if (!po) return <div className="flex h-[80vh] items-center justify-center animate-pulse text-indigo-600 font-bold uppercase tracking-widest text-xs">Loading Document...</div>;

  const companyName = docSettings?.companyName || "GITAKSHMI TECHNOLOGIES PRIVATE LIMITED";
  const vendor = po.vendorId || {};
  const items = po.items || [];
  const basicAmount = po.totalAmount || 0;
  const gstAmount = basicAmount * 0.18;
  const grandTotal = basicAmount + gstAmount;

  // Dynamic Terms from Settings
  const displayTerms = docSettings?.poTerms || [
    { term: 'AGAINST FORM NO', desc: 'NOT APPLICABLE' },
    { term: 'TEST CERTIFICATE', desc: 'REQUIRED' },
    { term: 'TRANSPORTATION', desc: 'Included' },
    { term: 'BRAND / SUPPORT / WARRANTY', desc: 'SONY / Yes / As and when Required' }
  ];

  const generalTerms = docSettings?.generalTerms || [
    "(1) Order Acceptance: Supplier should send order acceptance within three days of receipt of P.O. If the same is not received within the stipulated period it is understood that Supplier has accepted the order in totality.",
    "(2) Taxes & Duties: Supplier shall furnish to the Purchaser, GST Invoice to enable Purchaser to avail input tax credit. Supplier shall fulfill its liability of depositing GST &/or other taxes as per provision of latest notification of the Central/State Government without waiting for due payment to be received from the Purchaser.",
    "(3) Warranty: Supplier expressly warrants that all goods/ equipments/services ordered to specifications will confirm to the descriptions.",
    "(4) Packing & Transport: Goods/equipment should be properly packed to avoid damage during transit."
  ];

  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero";
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
        return "";
    };

    let str = "";
    let n = Math.floor(num);
    
    if (n >= 10000000) {
        str += convert(Math.floor(n / 10000000)) + " Crore ";
        n %= 10000000;
    }
    if (n >= 100000) {
        str += convert(Math.floor(n / 100000)) + " Lakh ";
        n %= 100000;
    }
    if (n >= 1000) {
        str += convert(Math.floor(n / 1000)) + " Thousand ";
        n %= 1000;
    }
    if (n > 0) {
        str += convert(n);
    }
    
    const paisa = Math.round((num - Math.floor(num)) * 100);
    if (paisa > 0) {
        str += (str ? " and " : "") + convert(paisa) + " Paisa";
    }

    return str.trim() + " Only";
  };

  const amountInWords = numberToWords(grandTotal);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Action Bar */}
      <div className="print:hidden max-w-[800px] mx-auto mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 font-bold text-sm hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} /> Back to List
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:bg-black transition-all">
          <Printer size={18} /> Print Official Document
        </button>
      </div>

      {/* PO DOCUMENT AREA */}
      <div ref={printRef} className="max-w-[850px] mx-auto space-y-10 print:space-y-0">
        {/* --- PAGE 1 --- */}
        <div className="bg-white shadow-2xl p-8 print:p-0 print:shadow-none print:max-w-none text-[12px] text-black border border-slate-300 print:border-none relative min-h-[1100px]">
          <div className="border border-black p-0">
            {/* Header Section */}
            <div className="flex justify-between items-start p-4">
              <div className="flex-1">
                <h1 className="text-lg font-black uppercase mb-1">{companyName}</h1>
                <div className="text-[10px] space-y-0.5 font-bold uppercase">
                  <p>{docSettings?.companyAddress || "OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006"}</p>
                  <p className="text-indigo-600 uppercase">www.gitakshmi.com</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                 <div className="text-3xl font-black text-indigo-700 opacity-20 transform -rotate-12 absolute pointer-events-none uppercase right-10 top-20">ORIGINAL</div>
                 {docSettings?.logo ? (
                   <img src={docSettings.logo} alt="Logo" className="h-20 w-auto object-contain" />
                 ) : (
                   <img src="/hgiel_logo.png" alt="Logo" className="h-20" onError={(e) => e.target.style.display='none'} />
                 )}
              </div>
            </div>

            {/* Title Box */}
            <div className="border-t border-b border-black text-center py-0.5 font-black uppercase bg-slate-50 tracking-[4px] text-[10px]">Purchase Order</div>

            {/* Info Grid */}
            <div className="grid grid-cols-10 border-b border-black">
              <div className="col-span-6 border-r border-black p-2 min-h-[120px]">
                <div className="grid grid-cols-6 gap-y-1 font-bold">
                  <span className="col-span-1 font-black uppercase">Supplier</span>
                  <span className="col-span-5 font-black text-indigo-900 tracking-tight">: {vendor.companyName || vendor.name || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">Address</span>
                  <span className="col-span-5 uppercase">: {vendor.address?.city || ""}, {vendor.address?.state || ""}, {vendor.address?.pincode || ""}</span>
                  <span className="col-span-1 font-black uppercase">City</span><span className="col-span-2 uppercase">: {vendor.address?.city || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">PAN</span><span className="col-span-2 uppercase">: {vendor.gstNumber?.substring(2,12) || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">Contact</span><span className="col-span-2 uppercase">: {vendor.name || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">Contact No</span><span className="col-span-2">: {vendor.phone || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">State</span><span className="col-span-2 uppercase">: {vendor.address?.state || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">GST</span><span className="col-span-2 uppercase">: {vendor.gstNumber || "N/A"}</span>
                  <span className="col-span-1 font-black uppercase">Email</span><span className="col-span-5">: {vendor.email || "N/A"}</span>
                </div>
              </div>
              <div className="col-span-4 p-2">
                <div className="grid grid-cols-4 gap-y-1 font-bold">
                  <span className="col-span-2 font-black uppercase">Order No</span><span className="col-span-2">: {po.poNumber}</span>
                  <span className="col-span-2 font-black uppercase">Order Date</span><span className="col-span-2">: {new Date(po.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className="col-span-2 font-black uppercase">Quote No</span><span className="col-span-2 uppercase">: By Mail</span>
                  <span className="col-span-2 font-black uppercase">Quote Date</span><span className="col-span-2">: {new Date(po.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className="col-span-2 font-black uppercase">Vendor Code</span><span className="col-span-2 uppercase">: {vendor.vendorId || "N/A"}</span>
                  <span className="col-span-2 font-black uppercase">Contact</span><span className="col-span-2">: -</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-black">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 font-black text-[10px] uppercase border-b border-black">
                    <th className="border-r border-black p-1.5 w-10 text-center">Sl No</th>
                    <th className="border-r border-black p-1.5">Description</th>
                    <th className="border-r border-black p-1.5 w-24 text-center">HSN / SAC</th>
                    <th className="border-r border-black p-1.5 w-16 text-center">UOM</th>
                    <th className="border-r border-black p-1.5 w-12 text-center">QTY</th>
                    <th className="border-r border-black p-1.5 w-24 text-right">Unit Price</th>
                    <th className="p-1.5 w-24 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="min-h-[150px]">
                      <td className="border-r border-black p-2 text-center align-top font-bold">{idx + 1}</td>
                      <td className="border-r border-black p-2 align-top font-medium uppercase font-black">{item.name}</td>
                      <td className="border-r border-black p-2 text-center align-top font-black">{item.hsn || "847130"}</td>
                      <td className="border-r border-black p-2 text-center align-top font-black">{item.uom || "Nos"}</td>
                      <td className="border-r border-black p-2 text-center align-top font-black">{item.quantity}</td>
                      <td className="border-r border-black p-2 text-right align-top font-black">₹{(item.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2 text-right align-top font-black">₹{(item.totalPrice || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                    <tr key={`filler-${i}`} className="h-10">
                      <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className=""></td>
                    </tr>
                  ))}
                  <tr className="border-t border-black">
                    <td colSpan={5} className="border-r border-black p-2">
                       <div className="grid grid-cols-6 text-[10px] gap-y-1 font-bold">
                          <span className="font-black uppercase">CIN</span><span className="col-span-5">: {docSettings?.cinNumber || "U72900GJ2019PTC110363"}</span>
                          <span className="font-black uppercase">GST NO</span><span className="col-span-5">: {docSettings?.gstNumber || "24AAICG0391B1Z2"}</span>
                          <span className="font-black uppercase">JURIDICTION</span><span className="col-span-5">: {docSettings?.jurisdiction || "MUNDRA"}</span>
                       </div>
                    </td>
                    <td className="border-r border-black p-2 font-black text-right space-y-1 uppercase text-[9px]">
                        <p>Basic Price</p><p>GST 18%</p><p className="border-t border-black pt-1">Grand Total</p>
                    </td>
                    <td className="p-2 font-black text-right space-y-1">
                        <p>₹{basicAmount.toLocaleString()}</p><p>₹{gstAmount.toLocaleString()}</p><p className="border-t border-black pt-1 text-indigo-700">₹{grandTotal.toLocaleString()}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In Words */}
            <div className="border-b border-black p-2 bg-slate-50 font-bold"><span className="font-black uppercase">In words:</span> **** INR {amountInWords}</div>

            {/* Addresses */}
            <div className="grid grid-cols-2 border-b border-black">
               <div className="border-r border-black p-2 min-h-[80px]">
                  <h4 className="font-black uppercase text-[10px] mb-1">Billing Address</h4>
                  <p className="text-[10px] leading-tight font-bold uppercase">{docSettings?.billingAddress || "OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006"}</p>
               </div>
               <div className="p-2">
                  <h4 className="font-black uppercase text-[10px] mb-1">Delivery Address</h4>
                  <p className="text-[10px] leading-tight font-bold uppercase">{docSettings?.deliveryAddress || "OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX, OFF C.G. ROAD, AMBAWADI, AHMEDABAD GJ 380006"}</p>
               </div>
            </div>

            {/* Terms Footer Box */}
            <div className="border-b border-black">
               <div className="p-2 font-black text-[10px] border-b border-black uppercase">Indent No: -</div>
               <div className="grid grid-cols-3">
                  <div className="border-r border-black p-2 font-bold"><p className="font-black text-[9px] uppercase mb-1">Payment Term</p><p>AFTER DELIVERY</p></div>
                  <div className="border-r border-black p-2 font-bold"><p className="font-black text-[9px] uppercase mb-1">Credit</p><p>WITHIN 30 DAYS</p></div>
                  <div className="p-2 font-bold"><p className="font-black text-[9px] uppercase mb-1">Delivery Details</p><p>IMMEDIATE</p></div>
               </div>
            </div>

            {/* Sr No Terms Table */}
            <div className="border-b border-black overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="font-black text-[9px] uppercase bg-slate-50 border-b border-black">
                        <th className="border-r border-black p-1.5 w-12 text-center">Sr No</th>
                        <th className="border-r border-black p-1.5 w-48">Term</th>
                        <th className="p-1.5">Description</th>
                     </tr>
                  </thead>
                  <tbody className="font-bold uppercase">
                     {displayTerms.map((t, i) => (
                       <tr key={i} className="border-b border-black last:border-b-0">
                         <td className="border-r border-black p-1 text-center font-black">{i + 1}</td>
                         <td className="border-r border-black p-1 uppercase font-black">{t.term}</td>
                         <td className="p-1 font-black uppercase">: {t.desc}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Remarks Box */}
            <div className="border-b border-black p-2 bg-slate-50 font-bold"><span className="font-black uppercase text-[10px]">Remarks:</span> <span className="uppercase italic">{docSettings?.remarks || "Please provide Serial Number in billing"}</span></div>

            {/* Final Footer Section */}
            <div className="relative p-6 flex flex-col items-end min-h-[140px]">
               <div className="text-right w-full mb-1"><p className="font-black text-[11px] uppercase tracking-tighter">for, {companyName}</p></div>
               <div className="absolute right-12 bottom-6 h-28 w-28 border-2 border-blue-900 rounded-full flex items-center justify-center opacity-70 border-dotted">
                  <div className="h-24 w-24 border border-blue-900 rounded-full flex flex-col items-center justify-center text-[7px] text-blue-950 font-black uppercase text-center p-2">
                     <p className="mb-1 leading-tight tracking-tighter">{docSettings?.stampTopText || companyName}</p>
                     <div className="h-6 w-6 border border-blue-900 rounded-full flex items-center justify-center text-[5px] my-0.5 font-black">{docSettings?.stampMiddleText || "STAMP"}</div>
                     <p className="mt-0.5">{docSettings?.stampBottomText || "AHMEDABAD"}</p>
                  </div>
               </div>
               <div className="text-right w-full mt-auto">
                  <div className="inline-block border-t border-black pt-1.5 w-64 text-center font-black uppercase text-[10px] tracking-widest">Authorized Signatory</div>
               </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest absolute bottom-4 left-0 right-0">Page 1 of 2</div>
        </div>

        {/* --- PAGE 2 --- */}
        <div className="bg-white shadow-2xl p-8 print:p-0 print:shadow-none print:max-w-none text-[12px] text-black border border-slate-300 print:border-none relative min-h-[1100px] print:break-before-page">
          <div className="border border-black p-4 min-h-[1050px]">
             <div className="flex justify-between items-start border-b border-black pb-2 mb-4">
                <div className="font-black uppercase text-[11px]">{companyName}</div>
                <div className="text-[10px] font-black uppercase">PO number/date &nbsp;&nbsp;&nbsp;&nbsp; {po.poNumber} / {new Date(po.createdAt).toLocaleDateString('en-GB')}</div>
             </div>
             <div className="mb-8">
                <h2 className="font-black uppercase text-[11px] underline mb-4">Special Terms & Conditions</h2>
                <div className="grid grid-cols-10 gap-y-2 text-[10px] font-bold">
                   <div className="col-span-2 font-black uppercase tracking-tighter">VENDOR BANK DETAIL</div>
                   <div className="col-span-8">
                      <span className="font-black">:&nbsp;&nbsp;BANK NAME</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {vendor.bankAccount?.bankName || 'N/A'} &nbsp;&nbsp;
                      <span className="font-black">A/C No.</span>: {vendor.bankAccount?.accountNumber || 'N/A'}
                   </div>
                   <div className="col-span-2 font-black uppercase tracking-tighter">Special Instructions</div>
                   <div className="col-span-8 text-justify font-black uppercase text-[9px] leading-tight"><span className="font-black">:</span>&nbsp;&nbsp; {docSettings?.specialInstructions || "Please send us your order acceptance immediately..."}</div>
                </div>
             </div>
             <div className="space-y-4">
                <h2 className="font-black uppercase text-[11px] underline">GENERAL TERMS & CONDITIONS</h2>
                <p className="text-[9px] leading-tight font-black uppercase">Following are the General Terms & Conditions applicable to this PO. In case of contradictions, Terms & Conditions mentioned in the main body of the PO shall take precedence over Terms & Conditions mentioned here.</p>
                <div className="space-y-3 text-justify leading-tight font-black uppercase text-[9px]">
                   {generalTerms.map((term, idx) => (
                     <p key={idx}>{term}</p>
                   ))}
                </div>
             </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest absolute bottom-4 left-0 right-0">Page 2 of 2</div>
        </div>
      </div>
    </div>
  );
}
