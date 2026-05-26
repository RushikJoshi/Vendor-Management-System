import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import html2pdf from "html2pdf.js";

const PRINT_STYLES = `
  @media print {
    @page { size: A4 portrait; margin: 10mm; }
    html { font-size: 9px !important; } /* Scales down all text and spacing heavily to guarantee 1 page */
    body { 
      margin: 0 !important; 
      padding: 0 !important; 
      background: white !important; 
      -webkit-print-color-adjust: exact !important; 
      color-adjust: exact !important; 
      print-color-adjust: exact !important;
    }
    .print\:hidden, nav, aside, header, footer, .sidebar, .navbar { display: none !important; }
    #print-root { 
      width: 100% !important; 
      max-width: 100% !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      box-shadow: none !important; 
      display: block !important; 
    }
    .bg-white { background: white !important; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    
    /* Force border printing */
    .border-black { border-color: black !important; }
    .border-gray-300 { border-color: black !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
  }
`;

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? a[Number(n[4])] + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
  return str.trim() ? str : '';
}

export default function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;
    const opt = {
      margin: 5,
      filename: `Tax_Invoice_${order?.soNumber || 'Order'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
  const client = order.clientId || {};
  const clientAddress = client.address || "20-22,1st floor, Punam Arcadew, Baroi Road\nMundra-370421.";
  const deliveryAddress = order.deliveryAddress || clientAddress;
  
  const STATE_MAP = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
    "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
    "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "26": "Dadra & Nagar Haveli & Daman & Diu", "27": "Maharashtra", "28": "Andhra Pradesh",
    "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
    "34": "Puducherry", "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh",
    "38": "Ladakh"
  };

  const clientGstin = client.gstin || "24AAICG0391B1Z2";
  const clientStateCode = clientGstin.substring(0, 2);
  const clientState = client.state || STATE_MAP[clientStateCode] || "Gujarat";

  const isInterState = clientStateCode !== "24";
  const igstRate = isInterState ? 18 : 0;
  const cgstRate = isInterState ? 0 : 9;
  const sgstRate = isInterState ? 0 : 9;

  const igstAmount = (basicAmount * igstRate) / 100;
  const cgstAmount = (basicAmount * cgstRate) / 100;
  const sgstAmount = (basicAmount * sgstRate) / 100;
  const grandTotal = basicAmount + igstAmount + cgstAmount + sgstAmount;
  const amountInWords = numberToWords(Math.round(grandTotal));

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB').replaceAll('/', '.');
  const invoiceTime = new Date(order.createdAt).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white print:p-0 p-4 md:p-8">
      <style>{PRINT_STYLES}</style>
      
      {/* Top Action Bar */}
      <div className="print:hidden w-[794px] mx-auto mb-6 flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="h-12 px-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={handleDownloadPDF}
               className="h-12 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95"
             >
               <Download size={16} /> Download PDF
             </button>
             <button 
               onClick={handlePrint}
               className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
             >
               <Printer size={16} /> Print
             </button>
          </div>
      </div>

      {/* DOCUMENT AREA */}
      <div id="print-root" ref={printRef} className="w-[794px] mx-auto bg-white text-black leading-tight font-sans relative shadow-md print:shadow-none">
        
        <div className="border border-black">
          {/* HEADER & COMPANY INFO (SPLIT LEFT/RIGHT) */}
          <div className="flex border-b border-black w-full">
          
          {/* LEFT COLUMN (65%) */}
          <div className="w-[65%] flex flex-col border-r border-black">
            {/* Header Left */}
            <div className="p-2 pl-3 border-b border-black flex items-center justify-start gap-8">
              <div className="flex items-center">
                 <img src="/logo.png" alt="Gitakshmi Logo" className="h-24 object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                 <div className="hidden items-center gap-2">
                    <div className="text-4xl font-bold text-indigo-700 tracking-tighter" style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-1px" }}>Gitakshmi</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mt-4">Technologies</div>
                 </div>
              </div>
              <div className="flex flex-col items-start justify-center text-left">
                <div className="font-black text-3xl tracking-wide uppercase text-gray-800">Tax Invoice</div>
                <div className="text-xs font-semibold mt-0.5">(u/s 31 of CGST Act r/w Rule 46)</div>
                <div className="font-bold mt-1 text-sm">MSME Regn No: TN-02-0074545</div>
              </div>
            </div>
            {/* Company Info Left */}
            <div className="flex flex-col flex-1">
              <div className="p-1 pl-5 bg-white">
                 <div className="font-bold text-2xl">Gitakshmi Technologies Private Limited</div>
                 <div className="leading-relaxed text-xl text-gray-800 space-y-0.5">
                   <div>Office No.701, 7th Floor, Kaivanna Complex,</div>
                   <div>Off C.G. Road, Ambawadi,</div>
                   <div>Ahmedabad, Gujarat 380006</div>
                 </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] mt-1 pb-1 text-lg gap-y-1">
                <div className="pl-5 font-semibold">GSTIN</div><div className="font-bold">: 24AAICG0391B1Z2</div>
                <div className="pl-5 font-semibold">PAN</div><div className="font-bold">: AAICG0391B</div>
                <div className="pl-5 font-semibold">Contact No</div><div className="font-bold">: +91 99999 99999</div>
                <div className="pl-5 font-semibold">CIN</div><div className="font-bold">: U72900GJ2019PTC110363</div>
                <div className="pl-5 font-semibold">Email ID</div><div className="font-bold">: info@gitakshmi.com</div>
                <div className="pl-5 font-semibold">State</div><div className="font-bold">: Gujarat</div>
                <div className="pl-5 font-semibold">IRN No</div><div className="font-bold break-all">: -</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (35%) */}
          <div className="w-[35%] flex flex-col">
            <div className="p-1.5 border-b border-black flex items-center justify-center">
               <div className="font-bold text-[15px] text-center">Original for Recipient</div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-2">
               {/* Large dense QR Code */}
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&data=${order.soNumber || 'INV'}-GitakshmiTechnologies-Invoice-Verification-Data-String-Padding-To-Increase-Density-1234567890`} alt="QR Code" className="w-[60%] aspect-square object-contain mix-blend-multiply opacity-90" />
            </div>
          </div>
        </div>

        {/* BILL TO & DELIVERY TO & INVOICE DETAILS */}
        <div className="flex border-b border-black">
          <div className="w-[30%] border-r border-black flex flex-col text-lg">
            <div className="p-2 pl-3 font-bold border-b border-black text-base">Receiver (Bill TO)</div>
            <div className="p-4 pl-5 flex-1 flex flex-col space-y-3">
              <div className="font-bold text-xl">{client.companyName || client.name || "Client Name"}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{clientAddress}</div>
              <div className="font-semibold">GSTIN: <span className="font-bold">{clientGstin}</span></div>
              <div className="font-semibold">PAN: <span className="font-bold"></span></div>
              <div className="font-semibold">State Code: <span className="font-bold">{clientStateCode}</span></div>
              <div className="font-semibold">State: <span className="font-bold">{clientState}</span></div>
            </div>
          </div>
          <div className="w-[30%] border-r border-black flex flex-col text-lg">
            <div className="p-2 pl-3 font-bold border-b border-black text-base">Consignee (Delivery To)</div>
            <div className="p-4 pl-5 flex-1 flex flex-col space-y-3">
              <div className="font-bold text-xl">{client.companyName || client.name || "Client Name"}</div>
              <div className="whitespace-pre-wrap leading-relaxed">{deliveryAddress}</div>
              <div className="font-semibold">GSTIN: <span className="font-bold">{clientGstin}</span></div>
              <div className="font-semibold">PAN: <span className="font-bold"></span></div>
              <div className="font-semibold">State Code: <span className="font-bold">{clientStateCode}</span></div>
              <div className="font-semibold">State: <span className="font-bold">{clientState}</span></div>
            </div>
          </div>
          <div className="w-[40%] flex flex-col text-[14px]">
            <div className="grid grid-cols-[auto_1fr] h-full content-evenly pt-1 pb-1">
               <div className="p-0.5 pl-3 flex items-center">Invoice No</div><div className="p-0.5 pl-2 flex items-center">{order.soNumber || "6100000844"}</div>
               <div className="p-0.5 pl-3 flex items-center">Invoice Date</div><div className="p-0.5 pl-2 flex items-center">{invoiceDate}</div>
               <div className="p-0.5 pl-3 flex items-center">Time of Invoice</div><div className="p-0.5 pl-2 flex items-center">{invoiceTime}</div>
               <div className="p-0.5 pl-3 flex items-center">Reverse Charge</div><div className="p-0.5 pl-2 flex items-center">Not Applicable</div>
               <div className="p-0.5 pl-3 flex items-center">PO/Sow No.</div><div className="p-0.5 pl-2 flex items-center">Prof Service</div>
               <div className="p-0.5 pl-3 flex items-center">PO/Sow Date</div><div className="p-0.5 pl-2 flex items-center">01.11.2024</div>
               <div className="p-0.5 pl-3 flex items-center">Payment Terms</div><div className="p-0.5 pl-2 flex items-center leading-tight">Pay immediately w/o deduction</div>
               <div className="p-0.5 pl-3 flex items-center">Place of Supply</div><div className="p-0.5 pl-2 flex items-center">{clientState}</div>
               <div className="p-0.5 pl-3 flex items-center">Order No.</div><div className="p-0.5 pl-2 flex items-center">70000162</div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="border-b border-black">
          <table className="w-full text-center border-collapse text-sm">
            <thead className="font-bold border-b border-black">
              <tr>
                <th className="border-r border-black p-2 w-[5%] font-semibold">Sr.No</th>
                <th className="border-r border-black p-2 text-left w-[25%] font-semibold">Description of Services</th>
                <th className="border-r border-black p-2 font-semibold">HSN/SAC Code</th>
                <th className="border-r border-black p-2 font-semibold">UOM</th>
                <th className="border-r border-black p-2 font-semibold">QTY</th>
                <th className="border-r border-black p-2 font-semibold">Rate</th>
                <th className="border-r border-black p-2 font-semibold">Value</th>
                <th className="border-r border-black p-2 font-semibold">IGST<br/>%</th>
                <th className="border-r border-black p-2 font-semibold">Value</th>
                <th className="border-r border-black p-2 font-semibold">CGST<br/>%</th>
                <th className="border-r border-black p-2 font-semibold">Value</th>
                <th className="border-r border-black p-2 font-semibold">SGST<br/>%</th>
                <th className="border-r border-black p-2 font-semibold">Value</th>
                <th className="p-2 font-semibold">Gross<br/>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                // Dummy Item for visual matching if no items
                <tr className="border-b border-gray-300 font-bold">
                  <td className="border-r border-black p-1">1</td>
                  <td className="border-r border-black p-1 text-left">Professional Service<br/>Mani</td>
                  <td className="border-r border-black p-1">998313</td>
                  <td className="border-r border-black p-1">HR</td>
                  <td className="border-r border-black p-1">122.00</td>
                  <td className="border-r border-black p-1 text-right">600.00</td>
                  <td className="border-r border-black p-1 text-right">73,200.00</td>
                  <td className="border-r border-black p-1">{igstRate.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-right">{((73200 * igstRate) / 100).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="border-r border-black p-1">{cgstRate.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-right">{((73200 * cgstRate) / 100).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="border-r border-black p-1">{sgstRate.toFixed(2)}</td>
                  <td className="border-r border-black p-1 text-right">{((73200 * sgstRate) / 100).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="p-1 text-right">86,376.00</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const itemTotal = (item.quantity * item.unitPrice) || item.totalPrice || 0;
                  const itemIgst = (itemTotal * igstRate) / 100;
                  const itemCgst = (itemTotal * cgstRate) / 100;
                  const itemSgst = (itemTotal * sgstRate) / 100;
                  const itemGross = itemTotal + itemIgst + itemCgst + itemSgst;
                  return (
                  <tr key={idx} className="border-b border-gray-300 font-bold">
                    <td className="border-r border-black p-1">{idx + 1}</td>
                    <td className="border-r border-black p-1 text-left whitespace-pre-wrap">{item.name || "Professional Service\\nMani"}</td>
                    <td className="border-r border-black p-1">{item.hsn || "998313"}</td>
                    <td className="border-r border-black p-1 uppercase">{item.uom || "HR"}</td>
                    <td className="border-r border-black p-1">{item.quantity?.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{item.unitPrice?.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{itemTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{igstRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{itemIgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{cgstRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{itemCgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{sgstRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{itemSgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="p-1 text-right">{itemGross.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                )})
              )}
              
              {/* Spacer rows */}
              <tr className="h-6">
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td className="border-r border-black"></td>
                 <td className="border-r border-black"></td><td></td>
              </tr>
            </tbody>
            {/* TOTAL ROW */}
            <tfoot>
               <tr className="font-bold border-t border-b border-black text-base">
                  <td colSpan={6} className="border-r border-black p-1.5 text-left pl-3">Total</td>
                  <td className="border-r border-black p-1.5 text-right">{basicAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5 text-right">{igstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5 text-right">{cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5 text-right">{sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="p-1.5 text-right">{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
               </tr>
               <tr className="font-bold text-base">
                  <td colSpan={13} className="border-r border-black p-1.5 pr-6 text-right uppercase">INVOICE AMOUNT</td>
                  <td className="p-1.5 text-right">{grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
               </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-2 pl-3 font-bold border-b border-black text-lg">
           Amount In Words: {amountInWords} Rupees Only
        </div>

        {/* HSN SUMMARY TABLE */}
        <div className="w-full bg-white">
           <table className="w-full text-center border-collapse text-sm">
              <thead className="font-bold border-b border-black">
                 <tr>
                    <th className="border-r border-black p-1.5 font-semibold">HSN / SAC</th>
                    <th className="border-r border-black p-1.5 font-semibold">Taxable Value</th>
                    <th className="border-r border-black p-1.5 font-semibold">CGST<br/>%</th>
                    <th className="border-r border-black p-1.5 font-semibold">Amount</th>
                    <th className="border-r border-black p-1.5 font-semibold">SGST<br/>%</th>
                    <th className="border-r border-black p-1.5 font-semibold">Amount</th>
                    <th className="border-r border-black p-1.5 font-semibold">IGST %</th>
                    <th className="p-1.5 font-semibold">Amount</th>
                 </tr>
              </thead>
              <tbody>
                 <tr className="font-bold">
                    <td className="border-r border-black p-1">998313</td>
                    <td className="border-r border-black p-1 text-right">{basicAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{cgstRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{cgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{sgstRate.toFixed(2)}</td>
                    <td className="border-r border-black p-1 text-right">{sgstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="border-r border-black p-1">{igstRate.toFixed(2)}</td>
                    <td className="p-1 text-right">{igstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                 </tr>
              </tbody>
           </table>
        </div>
      </div>

        {/* FOOTER AREA */}
        <div className="p-2 flex flex-col gap-2 text-sm">
           
           <div>
              <div className="font-bold underline mb-1 tracking-wide text-base">Declarations:</div>
              <div className="font-bold text-gray-900 space-y-1">
                 <div>1) I/We declare that this invoice shows actual price of the services described and that all particulars are true and correct.</div>
                 <div>2) Subject to the jurisdiction of courts in Ahmedabad.</div>
              </div>
           </div>

           <div>
              <div className="font-bold underline mb-1 tracking-wide text-base">Our Bank Details:</div>
              <div className="font-bold text-gray-900 space-y-1">
                 <div>Bank Name : <span className="pl-4">HDFC Bank</span></div>
                 <div>Account No : <span className="pl-5">00102320001213</span></div>
                 <div>Branch & IFS Code: HDFC0000010.</div>
              </div>
           </div>

           <div className="flex justify-between items-end mt-4 relative">
              <div className="flex flex-col gap-1 font-bold text-sm">
                 <div className="flex"><span className="w-16">Place</span> Ahmedabad</div>
                 <div className="flex"><span className="w-16">Date</span> {invoiceDate}</div>
              </div>

              <div className="flex flex-col items-end gap-6 font-bold text-base absolute right-0 bottom-0">
                 <div>Gitakshmi Technologies Private Limited</div>
                 <div>Authorised Signatory</div>
              </div>
           </div>

           <div className="flex justify-between font-bold text-gray-900 mt-6 pt-2 border-t border-gray-300">
              <div>E. & O.E</div>
              <div className="text-gray-500 font-semibold text-xs pr-2">1 / 1</div>
           </div>
        </div>

      </div>

    </div>
  );
}


