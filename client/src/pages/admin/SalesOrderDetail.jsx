import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2, MessageSquare, Printer, Download, ArrowLeft, CreditCard } from "lucide-react";
import html2pdf from "html2pdf.js";

const PRINT_STYLES = `
  @media print {
    @page { size: A4; margin: 8mm 10mm 8mm 10mm !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: white !important; width: 100% !important; height: auto !important; overflow: visible !important; }
    .min-h-screen, .bg-slate-100 { min-height: 0 !important; background: white !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
    .print\\:hidden, nav, aside, header, footer, .sidebar, .navbar { display: none !important; }
    main { margin-top: 0 !important; padding: 0 !important; overflow: visible !important; }
    [class*="lg:pl-"], [class*="pl-"] { padding-left: 0 !important; }
    .admin-readable, .admin-readable > div, .overflow-hidden { overflow: visible !important; min-height: 0 !important; height: auto !important; }
    #print-root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; transform: none !important; display: block !important; overflow: visible !important; }
    .bg-white { background: white !important; padding: 0 !important; width: 100% !important; }
    .shadow-2xl, .shadow-sm, .shadow-md { box-shadow: none !important; }
    .border-slate-300 { border: none !important; }
    .min-h-\\[950px\\], .min-h-\\[1100px\\] { min-height: 0 !important; height: auto !important; page-break-after: auto !important; padding: 0 !important; border: none !important; margin-bottom: 0 !important; }
    .p-8 { padding: 0 !important; }
    .p-4 { padding: 3px !important; }
    .p-2 { padding: 2px !important; }
    .p-1.5 { padding: 1px !important; }
    .min-h-\\[110px\\] { min-height: 80px !important; padding: 4px !important; }
    .mt-10 { margin-top: 0 !important; }
    .mt-6 { margin-top: 2px !important; }
    .mb-8 { margin-bottom: 8px !important; }
    .space-y-10 > :not([hidden]) ~ :not([hidden]) { margin-top: 0 !important; margin-bottom: 0 !important; }
    .gap-y-1 { row-gap: 2px !important; }
    table, tr, td, .grid { page-break-inside: avoid !important; }
    thead th { vertical-align: middle !important; height: 18px !important; padding: 2px !important; line-height: 1.0 !important; font-size: 11px !important; }
    tbody td { vertical-align: middle !important; padding: 2px 3px !important; line-height: 1.0 !important; font-size: 11px !important; }
    .print-page { min-height: 278mm !important; height: auto !important; position: relative; page-break-after: always; border: none !important; margin-bottom: 0 !important; box-sizing: border-box !important; width: 100% !important; }
    .print-page:last-child { page-break-after: avoid !important; }
    * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
  }
`;

function numberToWords(num) {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (Number(n[4]) !== 0) ? a[Number(n[4])] + 'hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
  return str.toUpperCase();
}

function formatItemName(name) {
  if (!name) return { main: "", sub: null };
  const str = name.trim();
  const match = str.match(/^(.*?)\((.*?)\)(.*)$/);
  if (match) {
    const mainPart = match[1].trim();
    const parenPart = match[2].trim();
    const restPart = match[3].trim();
    const formattedMain = mainPart.toLowerCase().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
    const formattedParen = parenPart.split(',').map(item => {
      const trimmed = item.trim().toLowerCase();
      if (!trimmed) return '';
      return trimmed.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
    }).join(', ');
    return { main: formattedMain, sub: `(${formattedParen})${restPart ? ' ' + restPart.toLowerCase().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ') : ''}` };
  }
  return { main: str.toLowerCase().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' '), sub: null };
}

export default function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("document");
  const printRef = useRef();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/sales-orders/${id}`);
      setOrder(data.data);
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.put(`/sales-orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `SO_${order.soNumber || 'Order'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const items = order.items || [];
  const basicAmount = items.reduce((sum, it) => sum + (it.totalPrice || (it.quantity * it.unitPrice) || 0), 0);
  const gstAmount = basicAmount * 0.18;
  const grandTotal = basicAmount + gstAmount;
  const companyName = "GITAKSHMI TECHNOLOGIES PRIVATE LIMITED";

  const client = order.clientId || {};
  const clientAddress = client.address || "";
  const isSameState = clientAddress.toLowerCase().includes("gujarat") || clientAddress.toLowerCase().includes("gj") || clientAddress === "";
  const amountInWords = numberToWords(Math.round(grandTotal));

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <style>{PRINT_STYLES}</style>
      
      {/* Top Action Bar */}
      <div className="print:hidden max-w-[850px] mx-auto mb-6 flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-3">
             {user?.role?.toLowerCase() === 'client' ? (
                <div className="h-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center text-sm font-black uppercase text-indigo-600 shadow-sm">
                   STATUS: {order.status}
                </div>
             ) : (
                <select value={order.status} onChange={handleStatusChange} className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500">
                   <option value="Draft">Draft</option>
                   <option value="Sent">Sent</option>
                   <option value="Accepted">Accepted</option>
                   <option value="Invoiced">Invoiced</option>
                   <option value="Paid">Paid</option>
                   <option value="Cancelled">Cancelled</option>
                </select>
             )}
             
             {user?.role?.toLowerCase() === 'client' && order.status !== 'Paid' && (
               <button 
                 onClick={() => navigate(`/client/orders/${order._id}/pay`)}
                 className="h-12 px-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
               >
                 <CreditCard size={18} /> Pay Now
               </button>
             )}

             <button 
               onClick={handleDownloadPDF}
               className="h-12 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95"
             >
               <Download size={16} /> Download PDF
             </button>
             <button 
               onClick={handlePrint}
               className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
             >
               <Printer size={16} /> Print
             </button>
          </div>
      </div>

      {/* Tab Navigation */}
      <div className="print:hidden max-w-[850px] mx-auto mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-2 shadow-sm">
         <button 
           onClick={() => setActiveTab("document")}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'document' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
         >
           <Printer size={16} /> Official Document
         </button>
         <button 
           onClick={() => setActiveTab("collaboration")}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'collaboration' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
         >
           <MessageSquare size={16} /> Activity & Discussion
         </button>
      </div>

      {/* DOCUMENT AREA */}
      {activeTab === 'document' && (
      <div id="print-root" ref={printRef} className="max-w-[850px] mx-auto space-y-10 print:space-y-0">
        <div className="bg-white p-8 print:p-0 print-page text-[12px] text-black relative min-h-[950px] flex flex-col shadow-sm">
          <div className="p-0 flex-1 flex flex-col pb-12">
            <div className="flex justify-between items-start p-4 pb-0">
              <div className="flex-1">
                <h1 className="text-xl print:text-lg font-black uppercase mb-1">{companyName}</h1>
                <div className="text-[10px] space-y-0.5 font-normal uppercase text-slate-700">
                  <p>OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,</p>
                  <p>OFF C.G. ROAD, AMBAWADI,</p>
                  <p>AHMEDABAD GJ 380006</p>
                  <p className="text-indigo-600 normal-case">www.gitakshmi.com</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                  <img src="/logo.png" alt="Logo" className="h-16" onError={(e) => e.target.style.display='none'} />
              </div>
            </div>
            <div className="relative flex justify-center items-center py-1 mt-2 mb-1 px-4">
               <div className="font-bold uppercase text-[11px] tracking-widest text-slate-800">
                  Sales Order
               </div>
               <span className="absolute right-4 text-[10px] font-black text-slate-800 tracking-wider uppercase">
                  Original
               </span>
            </div>
            {/* Info Grid */}
            <div className="flex border-x border-t border-b border-black mt-2">
              <div className="flex-1 border-r border-black p-2 min-h-[120px]">
                <div className="grid grid-cols-6 gap-y-1 text-[10px]">
                  <span className="col-span-1 font-bold uppercase">Client</span>
                  <span className="col-span-5 font-bold text-indigo-900">: {client.companyName || client.name || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Address</span>
                  <span className="col-span-5 uppercase">: {clientAddress || "N/A"}</span>
                  <span className="col-span-1 font-bold text-indigo-600 uppercase">Delivery</span>
                  <span className="col-span-5 uppercase font-bold text-indigo-900">: {order.deliveryAddress || clientAddress || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase mt-1">PAN</span><span className="col-span-2 uppercase mt-1">: {client.gstin ? client.gstin.substring(2,12) : "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase mt-1">Contact</span><span className="col-span-2 uppercase mt-1">: {client.name || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Phone</span><span className="col-span-2">: {client.phone || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Email</span><span className="col-span-2 uppercase overflow-hidden">: {client.email?.split('@')[0]}</span>
                </div>
              </div>
              <div className="w-[25%] print:w-[25%] shrink-0 p-2 text-[10px]">
                <div className="grid grid-cols-5 gap-y-1">
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order No</span><span className="col-span-3 font-bold">: {order.soNumber}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order Date</span><span className="col-span-3">: {new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Status</span><span className="col-span-3 font-bold uppercase text-indigo-700">: {order.status}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-x border-b border-black">
              <table className="items-table w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="font-bold text-[10px] uppercase border-b border-black" style={{ height: '24px', verticalAlign: 'middle' }}>
                    <th className="border-r border-black w-[6%] print:w-[5%] text-center whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', height: '24px', padding: '0px', lineHeight: '1.2' }}>Sl No</th>
                    <th className="border-r border-black px-2 align-middle text-left" style={{ verticalAlign: 'middle', height: '24px', paddingTop: '0px', paddingBottom: '0px', lineHeight: '1.2' }}>Description</th>
                    <th className="border-r border-black w-[12%] print:w-[10%] text-center align-middle whitespace-nowrap" style={{ verticalAlign: 'middle', height: '24px', padding: '0px', lineHeight: '1.2' }}>HSN / SAC</th>
                    <th className="border-r border-black w-[10%] print:w-[8%] text-center align-middle" style={{ verticalAlign: 'middle', height: '24px', padding: '0px', lineHeight: '1.2' }}>UOM</th>
                    <th className="border-r border-black w-[12%] print:w-[7%] text-center align-middle" style={{ verticalAlign: 'middle', height: '24px', padding: '0px', lineHeight: '1.2' }}>QTY</th>
                    <th className="border-r border-black w-[12%] print:w-[12%] text-right px-2 align-middle whitespace-nowrap" style={{ verticalAlign: 'middle', height: '24px', paddingTop: '0px', paddingBottom: '0px', lineHeight: '1.2' }}>Unit Price</th>
                    <th className="w-[13%] print:w-[13%] text-right px-2 align-middle whitespace-nowrap" style={{ verticalAlign: 'middle', height: '24px', paddingTop: '0px', paddingBottom: '0px', lineHeight: '1.2' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="min-h-[150px] text-[10px]">
                      <td className="border-r border-black p-2 text-center align-middle" style={{ verticalAlign: 'middle' }}>{idx + 1}</td>
                      <td className="border-r border-black p-2 align-middle" style={{ verticalAlign: 'middle' }}>
                        {(() => {
                          const formatted = formatItemName(item.name);
                          return (
                            <div className="flex flex-col gap-[1px]">
                              <div className="font-bold text-[11px] print:text-[10px] text-slate-900 leading-tight">
                                {formatted.main}
                              </div>
                              {formatted.sub && (
                                <div className="text-[8.5px] print:text-[7.5px] text-slate-500 font-medium leading-tight">
                                  {formatted.sub}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="border-r border-black p-2 text-center align-middle" style={{ verticalAlign: 'middle' }}>{item.hsn || "847130"}</td>
                      <td className="border-r border-black p-2 text-center align-middle" style={{ verticalAlign: 'middle' }}>{item.uom || "Nos"}</td>
                      <td className="border-r border-black p-2 text-center align-middle font-bold" style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                      <td className="border-r border-black p-2 text-right align-middle" style={{ verticalAlign: 'middle' }}>₹{(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right align-middle font-bold" style={{ verticalAlign: 'middle' }}>₹{((item.quantity * item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {/* Dynamic Blank Spacer Rows */}
                  {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                    <tr key={`blank-${i}`} className="h-[30px] print:h-[22px]">
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                  <tr className="border-t border-black text-[10px]">
                    <td colSpan={5} className="p-2 print:p-0.5 align-middle" style={{ verticalAlign: 'middle' }}>
                       <div className="grid grid-cols-6 gap-y-1 print:gap-y-0 text-[10px] print:text-[8px] print:leading-tight">
                          <span className="font-bold uppercase">CIN</span><span className="col-span-5">: U72900GJ2019PTC110363</span>
                          <span className="font-bold uppercase">GST NO</span><span className="col-span-5">: 24AAICG0391B1Z2</span>
                          <span className="font-bold uppercase">JURIDICTION</span><span className="col-span-5">: MUNDRA</span>
                       </div>
                    </td>
                    <td className="p-2 print:p-0.5 font-bold text-[9px] print:text-[8px] uppercase align-middle text-left whitespace-nowrap" style={{ verticalAlign: 'middle' }}>
                       <div className="flex flex-col gap-y-1 print:gap-y-0 print:leading-tight">
                          <span>Basic Price :</span>
                          {isSameState ? (
                              <>
                                 <span>Add: Output CGST 9% :</span>
                                 <span>Add: Output SGST 9% :</span>
                              </>
                           ) : (
                              <span>Add: Output IGST 18% :</span>
                           )}
                          <span className="font-bold pt-1 text-black">Grand Total :</span>
                       </div>
                    </td>
                    <td className="p-2 print:p-0.5 font-bold text-[9px] print:text-[8px] uppercase align-middle text-right" style={{ verticalAlign: 'middle' }}>
                       <div className="flex flex-col gap-y-1 print:gap-y-0 print:leading-tight">
                          <span>₹{basicAmount.toLocaleString('en-IN')}</span>
                          {isSameState ? (
                              <>
                                 <span>₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
                                 <span>₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
                              </>
                           ) : (
                              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                           )}
                          <span className="font-bold pt-1 text-black">₹{grandTotal.toLocaleString('en-IN')}</span>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-x border-b border-black p-2 text-[10px]"><span className="font-bold uppercase">In words:</span> **** INR {amountInWords}</div>
            
            <div className="border-x border-b border-black text-[10px]">
                <div className="p-2 print:p-1 font-bold border-b border-black uppercase">Indent No: -</div>
                <div className="flex border-b border-black bg-slate-200 print:bg-slate-200">
                   <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 print:p-1 font-bold text-[9px] print:text-[8px] uppercase">Payment Term</div>
                   <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 print:p-1 font-bold text-[9px] print:text-[8px] uppercase">Credit</div>
                   <div className="w-[25%] shrink-0 p-1.5 print:p-1 font-bold text-[9px] print:text-[8px] uppercase">Delivery Details</div>
                </div>
                <div className="flex">
                   <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 print:p-1 text-[10px] print:text-[8px] uppercase">AFTER DELIVERY</div>
                   <div className="w-[37.5%] shrink-0 border-r border-black p-1.5 print:p-1 text-[10px] print:text-[8px] uppercase">WITHIN 30 DAYS</div>
                   <div className="w-[25%] shrink-0 p-1.5 print:p-1 text-[10px] print:text-[8px] uppercase">IMMEDIATE</div>
                </div>
             </div>

            <div className="border-x border-b border-black flex-1 flex flex-col justify-end p-4 min-h-[110px]">
                {/* Signature Headers */}
                <div className="flex justify-between w-full mb-1">
                   <p className="font-bold text-[10px] uppercase">for, {client.companyName || client.name || 'CLIENT'}</p>
                   <p className="font-bold text-[10px] uppercase">for, {companyName}</p>
                </div>
                
                {/* Stamp/Sign Space */}
                <div className="relative h-20 w-full flex justify-between items-end">
                   <div className="relative h-20 flex items-center justify-start">
                      <div className="h-16 flex items-end">
                          <div className="w-40 border-b border-dashed border-slate-300 pb-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                            Sign & Stamp
                          </div>
                      </div>
                   </div>

                   {/* Right Side: Authorized Signatory Stamp */}
                   <div className="absolute right-12 bottom-0 h-20 w-20 border-2 border-blue-900 rounded-full flex items-center justify-center opacity-60 border-dotted">
                      <div className="h-16 w-16 border border-blue-900 rounded-full flex flex-col items-center justify-center text-[6px] text-blue-950 font-bold uppercase text-center p-1">
                         <p className="mb-0.5 leading-tight">{companyName}</p>
                         <div className="h-4 w-4 border border-blue-900 rounded-full flex items-center justify-center text-[4px] my-0.5 font-bold">STAMP</div>
                         <p className="mt-0.5">AHMD</p>
                      </div>
                   </div>
                </div>

                {/* Signatures Bottom Row */}
                <div className="flex justify-between w-full mt-3">
                   <div className="inline-block border-t border-black pt-1 w-56 text-center font-bold uppercase text-[9px]">
                      Accepted By Client
                   </div>
                   <div className="inline-block border-t border-black pt-1 w-56 text-center font-bold uppercase text-[9px]">
                      Authorized Signatory
                   </div>
                </div>
             </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute bottom-[10px] print:bottom-[8px] left-0 right-0">Page 1 of 1</div>
        </div>
      </div>
      )}

      {activeTab === 'collaboration' && (
        <div className="max-w-[850px] mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">
           <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold uppercase tracking-widest text-sm mb-2">Activity & Discussion</p>
              <p className="text-xs">No recent activity on this sales order.</p>
           </div>
        </div>
      )}
    </div>
  );
}
