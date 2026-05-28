import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProcurementContext } from "../../context/ProcurementContext";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import procurementApi from "../../services/procurementApi";
import CommentSection from "../../components/CommentSection";
import { toast } from "react-hot-toast";
import { Check, X, Loader2, MessageSquare, CreditCard, ArrowLeft, Printer, Download, ArrowRight, Trash2, Edit } from "lucide-react";
import html2pdf from "html2pdf.js";

const PRINT_STYLES = `
  @media print {
    @page {
      size: A4;
      margin: 8mm 10mm 8mm 10mm !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    .min-h-screen, .bg-slate-100 {
      min-height: 0 !important;
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
    }
    .print\:hidden, nav, aside, header, footer, .sidebar, .navbar {
      display: none !important;
    }
    
    /* Clear sidebar padding and margins from parent wrappers safely */
    main {
      margin-top: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
    }
    
    /* Clear lg:pl-17rem sidebar offsets in print mode */
    [class*="lg:pl-"], [class*="pl-"] {
      padding-left: 0 !important;
    }
    
    /* Reset container overflow to show all content pages */
    .admin-readable, .admin-readable > div, .overflow-hidden {
      overflow: visible !important;
      min-height: 0 !important;
      height: auto !important;
    }
    
    /* Force print-root to span the full available width */
    #print-root {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      transform: none !important;
      display: block !important;
      overflow: visible !important;
    }
    
    .bg-white {
      background: white !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .shadow-2xl, .shadow-sm, .shadow-md {
      box-shadow: none !important;
    }
    .border-slate-300 {
      border: none !important;
    }
    .min-h-\\[950px\\], .min-h-\\[1100px\\] {
      min-height: 0 !important;
      height: auto !important;
      page-break-after: auto !important;
      padding: 0 !important;
      border: none !important;
      margin-bottom: 0 !important;
    }
    /* Compact layout adjustments to avoid spillover */
    .p-8 {
      padding: 0 !important;
    }
    .p-4 {
      padding: 3px !important;
    }
    .p-2 {
      padding: 2px !important;
    }
    .p-1.5 {
      padding: 1px !important;
    }
    .min-h-\\[110px\\] {
      min-height: 80px !important;
      padding: 4px !important;
    }
    .mt-10 {
      margin-top: 0 !important;
    }
    .mt-6 {
      margin-top: 2px !important;
    }
    .mb-8 {
      margin-bottom: 8px !important;
    }
    .space-y-10 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    
    /* Shrink grid spacing */
    .gap-y-1 {
      row-gap: 2px !important;
    }
    
    /* Control table breaks */
    table, tr, td, .grid {
      page-break-inside: avoid !important;
    }
    thead th {
      vertical-align: middle !important;
      height: 18px !important;
      padding: 2px !important;
      line-height: 1.0 !important;
      font-size: 11px !important;
    }
    tbody td {
      vertical-align: middle !important;
      padding: 2px 3px !important;
      line-height: 1.0 !important;
      font-size: 11px !important;
    }
    
    
    .print-page {
      min-height: 278mm !important;
      height: auto !important;
      position: relative;
      page-break-after: always;
      border: none !important;
      margin-bottom: 0 !important;
      box-sizing: border-box !important;
      width: 100% !important;
    }
    .print-page:last-child {
      page-break-after: avoid !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
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

    const formattedMain = mainPart
      .toLowerCase()
      .split(' ')
      .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
      .join(' ');

    const formattedParen = parenPart
      .split(',')
      .map(item => {
        const trimmed = item.trim().toLowerCase();
        if (!trimmed) return '';
        return trimmed.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
      })
      .join(', ');

    return {
      main: formattedMain,
      sub: `(${formattedParen})${restPart ? ' ' + restPart.toLowerCase().split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ') : ''}`
    };
  }

  const formatted = str
    .toLowerCase()
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');

  return {
    main: formatted,
    sub: null
  };
}

function formatSpecifications(specs) {
  if (!specs) return "";
  return specs
    .split(',')
    .map(item => {
      const trimmed = item.trim().toLowerCase();
      if (!trimmed) return '';
      return trimmed.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
    })
    .join(', ');
}


export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, serviceOrders, invoices, loading, refreshAll } = useContext(ProcurementContext);
  const { user } = useAuth();
  const [po, setPo] = useState(null);
  const [working, setWorking] = useState(false);
  const [activeTab, setActiveTab] = useState("document");
  const printRef = useRef();

  useEffect(() => {
    const allOrders = [...(purchaseOrders || []), ...(serviceOrders || [])];
    if (allOrders.length > 0) {
      const found = allOrders.find(p => p._id === id);
      if (found) {
        setPo(found);
      } else {
        fetchDirectly();
      }
    } else if (!loading) {
      fetchDirectly();
    }
  }, [purchaseOrders, serviceOrders, id, loading]);

  const fetchDirectly = async () => {
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      setPo(res.data.data);
    } catch (err) {
      console.error("Failed to fetch order directly", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInitiatePayment = async () => {
    if (!po) return;
    setWorking(true);
    try {
      // Step 1: Check if an invoice already exists for this PO
      let allInvoices = invoices || [];
      if (allInvoices.length === 0) {
        // Context not loaded yet — fetch fresh
        await refreshAll();
        // Re-read from context is async; use API directly
        const freshRes = await procurementApi.listInvoices();
        allInvoices = freshRes.data?.data || [];
      }
      const existing = allInvoices.find(
        inv => String(inv.poId?._id || inv.poId) === String(po._id) && inv.status !== 'rejected'
      );
      if (existing) {
        toast.success("Invoice already exists — redirecting to payment");
        navigate(`/admin/procurement/payment/${existing._id}`);
        return;
      }

      // Step 2: No invoice found — create one
      const res = await procurementApi.createInvoice({
        poId: po._id,
        vendorId: po.vendorId?._id || po.vendorId,
        invoiceNumber: `INV-${po.poNumber}-${Date.now().toString().slice(-4)}`,
        totalAmount: po.totalAmount,
        invoiceDate: new Date(),
        lines: po.items.map(it => ({
          itemName: it.name || "Item",
          quantity: it.quantity,
          unitPrice: it.unitPrice
        })),
        status: 'approved'
      });
      toast.success("Payment request initiated");
      navigate(`/admin/procurement/payment/${res.data.data._id}`);
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error(err.response?.data?.message || "Could not initiate payment sequence");
    } finally {
      setWorking(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    if (!element) return;

    const opt = {
      margin: [0, 0],
      filename: `PO_${po.poNumber || 'Order'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!po) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const items = po.items || [];
  const basicAmount = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
  const gstAmount = basicAmount * 0.18;
  const grandTotal = basicAmount + gstAmount;
  const companyName = "GITAKSHMI TECHNOLOGIES PRIVATE LIMITED";
  const docSettings = po.docSettings || {};
  const generalTerms = [
    "(1) Order Acceptance: Supplier should send order acceptance immediately and in case of non- receipt of order confirmation within 3 working days, we presume that all terms & conditions mentioned in our purchase order is acceptable to you. Please send us material dispatch details on accounts@gitakshmi.com . Please mention our purchase order number & date while placing tax invoice.",
    "(2) Taxes & Duties: Supplier shall furnish to the Purchaser, GST Invoice to enable Purchaser to avail input tax credit. Supplier shall fulfill its liability of depositing GST &/or other taxes as per provision of latest notification of the Central/State Government without waiting for due payment to be received from the Purchaser.",
    "(3) Warranty: Supplier expressly warrants that all goods/ equipments/services ordered to specifications will confirm to the descriptions furnished by the Purchaser or if not ordered to specifications will be fit & sufficient for the purpose intended. All goods/ equipment/services are of good quality & workmanship and free of defects. Warranty period shall be minimum 12 months from the date of receipt at the Purchaser’s Works/Plant.",
    "(4) Packing & Transport: Goods/equipment should be properly packed to avoid damage during transit and should be dispatched along with packing list giving details of Purchase Order Number, Invoice Number. The cost of damaged Goods/equipment because of transit damage due to poor / faulty packing will be debited to the Supplier. The Supplier shall note that Vehicle delivering the Goods/Equipment shall only be allowed to enter Company's premises if the Driver has valid - RC Book, Driving License, Insurance copy & PUC Certificate.",
    "(5) Inspection & Replacement / Rework: Final inspection can be carried out at Supplier's works not withstanding this, the Purchaser reserves the right to reject any goods/ equipment / services which is defective / not conforming to the drawing, specification, sample, or as per other requirement mentioned in the Purchase Order. Rejected goods/ equipment shall be sent back at the expense of the Supplier including both way of transportation and testing. The Supplier shall be solely responsible for replacing the rejected goods/ equipment (to rectify in case of services) at their own cost within one month to meet Purchase Order requirement. If replacement is not received within a month, the Purchaser at his discretion can cancel the order and recover the payment made. For Rejected goods/equipment credit note required immediately after receipt of the same at the Supplier's Works.",
    "(6) Delivery ( Completion period): If the Supplier fails to make deliveries within the time specified, the Purchaser may terminate this Purchase Order either partly or fully. The Purchaser also reserves the right to Purchase the goods/equipment/services from any other Supplier and to charge the original Supplier for any loss incurred as a result thereof.",
    "(7) Cancellation: The Purchaser reserves the right to cancel this order or any part thereof at any time by written notice to the Supplier and recover the payment made.",
    "(8) Excess Supply: The Purchaser reserves the right to return quantities supplied in excess of ordered quantity. The Supplier shall take back such Excess Supply at their own cost & shall also fulfill the requirement of commercial settlement as per instructions of the Purchaser.",
    "(9) Demurrage: Any demurrage incurred due to goods remaining un-cleared because of delay in dispatch of documents/ faulty documents will be debited to the Supplier.",
    "(10) Documents: The Supplier shall fax/e-mail scanned copies of following documents when goods are ready for shipment. # Invoice # Packing List # Material Test Certificate and / or Equipment Inspection / Compliance Certificate. # Bill of Lading / Airway Bill, after dispatch. (In case of import) # Country of Origin Certificate (In case of import) Supplier shall send the originals of all above documents thru courier. Note: Above is indicative list. If required the Purchaser can ask for additional documents.",
    "(11) Transit Insurance: Transit insurance policy for transportation (by all modes) of ordered goods / equipment from warehouse/plant of the Supplier to the Purchaser Plant/Site shall be covered by the Supplier.",
    "(12) Jurisdictions: In case of disputes arising out of the Purchase Order, Courts within Ahmedabad, Gujarat, India only will have jurisdiction"
  ];

  const vendor = po.vendorId || {};
  const vendorState = vendor.address?.state?.toLowerCase() || "";
  const isSameState = vendorState.includes("gujarat") || vendorState === "gj";
  const amountInWords = numberToWords(grandTotal);

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
             {user && user.role !== "vendor" && po.status !== "paid" && (
                <button 
                  onClick={handleInitiatePayment}
                  disabled={working}
                  className="h-12 px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {working ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
                  Process Payment
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

      {/* PO DOCUMENT AREA */}
      {activeTab === 'document' && (
      <div id="print-root" ref={printRef} className="max-w-[850px] mx-auto space-y-10 print:space-y-0">
        <div className="bg-white p-8 print:p-0 print-page text-[12px] text-black relative min-h-[950px] flex flex-col shadow-sm">
          <div className="p-0 flex-1 flex flex-col pb-12">
            <div className="flex justify-between items-start p-4 pb-0">
              <div className="flex-1">
                <h1 className="text-xl print:text-lg font-black uppercase mb-1">{companyName}</h1>
                <div className="text-[10px] space-y-0.5 font-normal uppercase text-slate-700">
                  {docSettings?.companyAddress ? (
                    docSettings.companyAddress.split('\n').map((line, index) => (
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
              </div>
              <div className="text-right flex flex-col items-end">
                 {docSettings?.logo ? (
                   <img src={docSettings.logo} alt="Logo" className="h-16 w-auto object-contain" />
                 ) : (
                   <img src="/logo.png" alt="Logo" className="h-16" onError={(e) => e.target.style.display='none'} />
                 )}
              </div>
            </div>
            <div className="relative flex justify-center items-center py-1 mt-2 mb-1 px-4">
               <div className="font-bold uppercase text-[11px] tracking-widest text-slate-800">
                  {po.orderType === "SO" ? "Service Work Order" : "Purchase Order"}
               </div>
               <span className="absolute right-4 text-[10px] font-black text-slate-800 tracking-wider uppercase">
                  Original
               </span>
            </div>
            {/* Info Grid */}
            <div className="flex border-x border-t border-b border-black mt-2">
              <div className="flex-1 border-r border-black p-2 min-h-[120px]">
                <div className="grid grid-cols-6 gap-y-1 text-[10px]">
                  <span className="col-span-1 font-bold uppercase">Supplier</span>
                  <span className="col-span-5 font-bold text-indigo-900">: {vendor.companyName || vendor.name || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Address</span>
                  <span className="col-span-5 uppercase">: {vendor.address?.city || ""}, {vendor.address?.state || ""}, {vendor.address?.pincode || ""}</span>
                  <span className="col-span-1 font-bold uppercase">City</span><span className="col-span-2 uppercase truncate pr-2">: {vendor.address?.city && vendor.address.city.length > 25 ? "AHMEDABAD" : (vendor.address?.city || "N/A")}</span>
                  <span className="col-span-1 font-bold uppercase">PAN</span><span className="col-span-2 uppercase">: {vendor.gstNumber?.substring(2,12) || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Contact</span><span className="col-span-2 uppercase">: {vendor.name || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Contact No</span><span className="col-span-2">: {vendor.phone || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">State</span><span className="col-span-2 uppercase">: {vendor.address?.state || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">GST</span><span className="col-span-2 uppercase">: {vendor.gstNumber || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Pincode</span><span className="col-span-2 uppercase">: {vendor.address?.pincode || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">MSME Status</span><span className="col-span-2 uppercase">: {vendor.msmeStatus || vendor.msmeNumber || "N/A"}</span>
                  <span className="col-span-1 font-bold uppercase">Email</span><span className="col-span-5 uppercase break-all">: {vendor.email || "N/A"}</span>
                </div>
              </div>
              <div className="w-[25%] print:w-[25%] shrink-0 p-2 text-[10px]">
                <div className="grid grid-cols-5 gap-y-1">
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order No</span><span className="col-span-3 font-bold">: {po.poNumber}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Order Date</span><span className="col-span-3">: {new Date(po.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote No</span><span className="col-span-3 uppercase">: By Mail</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Quote Date</span><span className="col-span-3">: {new Date(po.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">Vendor Code</span><span className="col-span-3 uppercase">: {vendor.vendorId || "N/A"}</span>
                  <span className="col-span-2 font-bold uppercase whitespace-nowrap">{po.orderType === 'PO' ? 'Contact' : 'Project Ref'}</span><span className="col-span-3">: {po.orderType === 'PO' ? (docSettings?.contactEmail || '-') : '-'}</span>
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
                              <div className="font-bold text-[11px] print:text-[10px] text-slate-900 leading-tight whitespace-pre-wrap">
                                {formatted.main}
                              </div>
                              {formatted.sub && (
                                <div className="text-[8.5px] print:text-[7.5px] text-slate-500 font-medium leading-tight whitespace-pre-wrap">
                                  {formatted.sub}
                                </div>
                              )}
                              {item.specifications && (
                                <div className="text-[8.5px] print:text-[7.5px] text-slate-500 font-medium leading-tight whitespace-pre-wrap">
                                  {formatSpecifications(item.specifications)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="border-r border-black p-2 text-center align-middle" style={{ verticalAlign: 'middle' }}>{item.hsn || "847130"}</td>
                      <td className="border-r border-black p-2 text-center align-middle" style={{ verticalAlign: 'middle' }}>{item.uom || "Nos"}</td>
                      <td className="border-r border-black p-2 text-center align-middle font-bold" style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                      <td className="border-r border-black p-2 text-right align-middle" style={{ verticalAlign: 'middle' }}>₹{(item.unitPrice || 0).toLocaleString()}</td>
                      <td className="p-2 text-right align-middle font-bold" style={{ verticalAlign: 'middle' }}>₹{(item.totalPrice || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {/* Dynamic Blank Spacer Rows for empty entries to prevent print overflow */}
                  {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                    <tr key={`blank-${i}`} className="h-[30px] print:h-[22px]">
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                  {po.orderType === "SO" && (
                    <>
                      <tr className="text-[10px] print:text-[9px]">
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-2 font-bold text-slate-800">Note: All Responsibilities as Sow to Deliverable</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="p-1"></td>
                      </tr>
                      <tr className="h-[30px] print:h-[22px]">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t border-black text-[10px]">
                    <td colSpan={5} className="p-2 print:p-0.5 align-middle" style={{ verticalAlign: 'middle' }}>
                       <div className="grid grid-cols-6 gap-y-1 print:gap-y-0 text-[10px] print:text-[8px] print:leading-tight">
                          <span className="font-bold uppercase">CIN</span><span className="col-span-5">: {docSettings?.cinNumber || "U72900GJ2019PTC110363"}</span>
                          <span className="font-bold uppercase">GST NO</span><span className="col-span-5">: {docSettings?.gstNumber || "24AAICG0391B1Z2"}</span>
                          <span className="font-bold uppercase">JURIDICTION</span><span className="col-span-5">: {docSettings?.jurisdiction || "MUNDRA"}</span>
                       </div>
                    </td>
                    <td className="p-2 print:p-0.5 font-bold text-[9px] print:text-[8px] uppercase align-middle text-left whitespace-nowrap" style={{ verticalAlign: 'middle' }}>
                       <div className="flex flex-col gap-y-1 print:gap-y-0 print:leading-tight">
                          <span>Basic Price :</span>
                          {isSameState ? (
                              <>
                                 <span>Add: Input CGST 9% :</span>
                                 <span>Add: Input SGST 9% :</span>
                              </>
                           ) : (
                              <span>Add: Input IGST 18% :</span>
                           )}
                          <span className="font-bold pt-1 text-black">Grand Total :</span>
                       </div>
                    </td>
                    <td className="p-2 print:p-0.5 font-bold text-[9px] print:text-[8px] uppercase align-middle text-right" style={{ verticalAlign: 'middle' }}>
                       <div className="flex flex-col gap-y-1 print:gap-y-0 print:leading-tight">
                          <span>₹{basicAmount.toLocaleString()}</span>
                          {isSameState ? (
                              <>
                                 <span>₹{(gstAmount / 2).toLocaleString()}</span>
                                 <span>₹{(gstAmount / 2).toLocaleString()}</span>
                              </>
                           ) : (
                              <span>₹{gstAmount.toLocaleString()}</span>
                           )}
                          <span className="font-bold pt-1 text-black">₹{grandTotal.toLocaleString()}</span>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-x border-b border-black p-2 text-[10px]"><span className="font-bold uppercase">In words:</span> **** INR {amountInWords}</div>
            <div className="border-x border-b border-black text-[10px]">
               <div className="flex border-b border-black bg-slate-200 print:bg-slate-200">
                  <div className="w-1/2 border-r border-black p-1.5 font-bold text-[10px] uppercase">Billing Address</div>
                  <div className="w-1/2 p-1.5 font-bold text-[10px] uppercase">Delivery Address</div>
               </div>
               <div className="flex min-h-[80px] print:min-h-0">
                  <div className="w-1/2 border-r border-black p-2">
                     {docSettings?.billingAddress ? (
                       docSettings.billingAddress.split('\n').map((line, index) => (
                         <p key={index} className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">{line}</p>
                       ))
                     ) : (
                       <>
                         <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,</p>
                         <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">OFF C.G. ROAD, AMBAWADI,</p>
                          <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">AHMEDABAD GJ 380006</p>
                       </>
                     )}
                  </div>
                  <div className="w-1/2 p-2">
                     {docSettings?.deliveryAddress ? (
                       docSettings.deliveryAddress.split('\n').map((line, index) => (
                         <p key={index} className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">{line}</p>
                       ))
                     ) : (
                       <>
                         <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">OFFICE NO.701, 7TH FLOOR, KAIVANNA COMPLEX,</p>
                         <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">OFF C.G. ROAD, AMBAWADI,</p>
                          <p className="leading-tight uppercase text-[9px] print:text-[8px] print:leading-normal">AHMEDABAD GJ 380006</p>
                       </>
                     )}
                  </div>
               </div>
            </div>
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
            <div className="border-x border-b border-black overflow-hidden text-[11px]">
               <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                     <tr className="font-bold text-[10px] uppercase border-b border-black bg-slate-200 print:bg-slate-200">
                        <th className="border-r border-black p-1.5 text-center whitespace-nowrap text-[11px] print:text-[10px]" style={{ width: '6%' }}>Sr No</th>
                        <th className="border-r border-black p-1.5 px-2 text-[11px] print:text-[10px]" style={{ width: '31.5%' }}>Term</th>
                        <th className="p-1.5 px-2 text-[11px] print:text-[10px]" style={{ width: '62.5%' }}>Description</th>
                     </tr>
                  </thead>
                  <tbody className="uppercase">
                     {[
                       { term: "AGAINST FORM NO", desc: "NOT APPLICABLE" },
                       { term: "TEST CERTIFICATE", desc: "REQUIRED" },
                       { term: "TRANSPORTATION", desc: "INCLUDED" },
                       { term: "BRAND/SUPPORT/WARRANTY", desc: "YES" }
                     ].filter(t => !(po.orderType === "SO" && t.term === "TRANSPORTATION")).map((t, i) => (
                       <tr key={i}>
                         <td className="py-0.5 text-center font-bold align-middle text-[12px] print:text-[11px]">{i + 1}</td>
                         <td className="py-0.5 px-2 font-normal align-middle text-[12px] print:text-[11px]">{t.term}</td>
                         <td className="py-0.5 px-2 align-middle text-[12px] print:text-[11px]">: {t.desc}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="border-x border-b border-black p-2 text-[11px] print:text-[11px]">
              <div className="font-bold uppercase mb-1">Remarks:</div>
              <div className="italic leading-tight whitespace-pre-wrap">{docSettings?.remarks}</div>
            </div>
            
            <div className="border-x border-b border-black flex-1 flex flex-col justify-end p-4 min-h-[110px]">
                {/* Signature Headers */}
                <div className="flex justify-between w-full mb-1">
                   <p className="font-bold text-[10px] uppercase">for, {vendor.companyName || vendor.name || 'HOTLINESYSTEM'}</p>
                   <p className="font-bold text-[10px] uppercase">for, {companyName}</p>
                </div>
                
                {/* Stamp/Sign Space */}
                <div className="relative h-20 w-full flex justify-between items-end">
                   {/* Left Side: Accepted By Digital Signature */}
                   <div className="relative h-20 flex items-center justify-start">
                      {po.status !== 'pending' && po.status !== 'rejected' ? (
                         <div className="flex flex-col items-start text-left justify-end h-16 text-[9px] text-slate-800 font-medium">
                            <span className="italic font-bold text-indigo-700 text-[11px] font-serif leading-none mb-1">
                               {po.acceptedBy || vendor.name || 'HOTLINESYSTEM'}
                            </span>
                            <span className="text-[7.5px] uppercase text-slate-400 tracking-wider">
                               Digitally Accepted
                            </span>
                            <span className="text-[7.5px] text-slate-400">
                               Date: {new Date(po.updatedAt || po.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}
                            </span>
                         </div>
                      ) : (
                         <div className="h-16 flex items-end">
                            <div className="w-40 border-b border-dashed border-slate-300 pb-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                               Sign & Stamp
                            </div>
                         </div>
                      )}
                   </div>


                </div>

                {/* Signatures Bottom Row */}
                <div className="flex justify-between w-full mt-3">
                   <div className="inline-block border-t border-black pt-1 w-56 text-center font-bold uppercase text-[9px]">
                      Accepted By {po.status !== 'pending' && po.status !== 'rejected' && po.acceptedBy ? `: ${po.acceptedBy}` : ''}
                   </div>
                   <div className="inline-block border-t border-black pt-1 w-56 text-center font-bold uppercase text-[9px]">
                      Authorized Signatory
                   </div>
                </div>
             </div>
          </div>
          <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute bottom-[10px] print:bottom-[8px] left-0 right-0">Page 1 of 2</div>
        </div>

        <div className="bg-white p-8 print:p-0 print-page text-[12px] text-black relative min-h-[1100px] mt-10 print:mt-0 print:break-before-page shadow-sm">
           <div className="p-4 min-h-[1050px]">
             <div className="flex justify-between items-start border-b border-black pb-2 mb-4">
                <div className="font-black uppercase text-[11px]">{companyName}</div>
                <div className="text-[10px] font-black uppercase">{po.orderType === "SO" ? "SO number/date" : "PO number/date"} &nbsp;&nbsp;&nbsp;&nbsp; {po.poNumber} / {new Date(po.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}</div>
             </div>
             <div className="mb-4">
                <h2 className="font-black uppercase text-[11px] underline mb-4">Special Terms & Conditions</h2>
                <div className="flex flex-col gap-2 text-[9.9px] font-bold">
                    <div className="flex items-center">
                        <div className="w-[140px] shrink-0 font-bold uppercase tracking-tighter">VENDOR BANK DETAILS</div>
                        <div className="flex gap-6 text-blue-900 items-center">
                            <div className="flex gap-1 font-bold"><span>: BANK NAME :</span> <span className="underline font-bold">{vendor.bankAccount?.bankName || 'IDFC FIRST Bank'}</span></div>
                            <div className="flex gap-1 font-bold"><span>A/C NO :</span> <span className="underline font-bold">{vendor.bankAccount?.accountNumber || '10160248172'}</span></div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-[140px] shrink-0 font-bold uppercase tracking-tighter">SPECIAL INSTRUCTIONS</div>
                        <div className="flex-1 flex text-justify font-normal text-slate-800 leading-tight">
                            <span className="font-bold mr-1 shrink-0">:</span>
                            <div className="flex-1 whitespace-pre-wrap">{docSettings?.specialInstructions || "Please send us your order acceptance immediately and in case of non-receipt of order confirmation within 3 working days, we presume that all terms & conditions mentioned in our purchase order is acceptable to you. Please send us material dispatch details on accounts@gitakshmi.com . Please mention our purchase order number & date while placing tax invoice."}</div>
                        </div>
                    </div>
                </div>
              </div>
              {po.orderType !== "SO" && (
                <div className="space-y-2">
                <h2 className="font-black uppercase text-[11px] underline">GENERAL TERMS & CONDITIONS</h2>
                <p className="text-[9.9px] leading-tight uppercase font-bold">Following are the General Terms & Conditions applicable to this PO. In case of contradictions, Terms & Conditions mentioned in the main body of the PO shall take precedence over Terms & Conditions mentioned here.</p>
                <div className="space-y-1">
                    {generalTerms.map((term, idx) => {
                      const splitIdx = term.indexOf(':');
                      const heading = splitIdx !== -1 ? term.substring(0, splitIdx + 1) : '';
                      const rest = splitIdx !== -1 ? term.substring(splitIdx + 1).trim() : term;
                      return (
                        <div key={idx} className="flex flex-col gap-0.5 uppercase">
                          {heading && <span className="font-bold text-[9.9px] text-slate-900">{heading}</span>}
                          {(() => {
                            if (!rest.includes('#')) {
                              return (
                                <p className="font-normal text-[9.9px] leading-tight text-justify text-slate-700">
                                  {rest}
                                </p>
                              );
                            }
                            
                            const parts = rest.split('#');
                            const intro = parts[0].trim();
                            const bullets = [];
                            let outro = "";
                            
                            const separatorUpper = "(IN CASE OF IMPORT)";
                            for (let i = 1; i < parts.length; i++) {
                              const currentPart = parts[i].trim();
                              if (i === parts.length - 1) {
                                const currentPartUpper = currentPart.toUpperCase();
                                const sepIdx = currentPartUpper.indexOf(separatorUpper);
                                if (sepIdx !== -1) {
                                  bullets.push("# " + currentPart.substring(0, sepIdx + separatorUpper.length).trim());
                                  outro = currentPart.substring(sepIdx + separatorUpper.length).trim();
                                } else {
                                  bullets.push("# " + currentPart);
                                }
                              } else {
                                bullets.push("# " + currentPart);
                              }
                            }
                            
                            return (
                              <div className="font-normal text-[9.9px] leading-tight text-justify text-slate-700 space-y-0.5">
                                {intro && <p>{intro}</p>}
                                <div className="pl-3 py-0.5 space-y-0.5 font-normal text-slate-700">
                                  {bullets.map((b, bIdx) => (
                                    <p key={bIdx}>{b}</p>
                                  ))}
                                </div>
                                {outro && <p>{outro}</p>}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                </div>
              </div>
              )}
              
              {/* Dual Signature Block on Page 2 */}
               <div className="flex flex-col justify-end p-2 min-h-[110px] mt-8 print:mt-4">
                  {/* Signature Headers */}
                  <div className="flex justify-between w-full mb-1">
                     <p className="font-bold text-[10px] uppercase">for, {vendor.companyName || vendor.name || 'HOTLINESYSTEM'}</p>
                  </div>
                  
                  {/* Stamp/Sign Space */}
                  <div className="relative h-20 w-full flex justify-between items-end">
                      {/* Left Side: Accepted By Digital Signature */}
                      <div className="relative h-20 flex items-center justify-start">
                         {po.status !== 'pending' && po.status !== 'rejected' ? (
                            <div className="flex flex-col items-start text-left justify-end h-16 text-[9px] text-slate-800 font-medium">
                               <span className="italic font-bold text-indigo-700 text-[11px] font-serif leading-none mb-1">
                                  {po.acceptedBy || vendor.name || 'HOTLINESYSTEM'}
                               </span>
                               <span className="text-[7.5px] uppercase text-slate-400 tracking-wider">
                                  Digitally Accepted
                               </span>
                               <span className="text-[7.5px] text-slate-400">
                                  Date: {new Date(po.updatedAt || po.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}
                               </span>
                            </div>
                         ) : (
                            <div className="h-16 flex items-end">
                               <div className="w-40 border-b border-dashed border-slate-300 pb-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                  Sign & Stamp
                               </div>
                            </div>
                         )}
                      </div>
                  </div>

                  {/* Signatures Bottom Row */}
                  <div className="flex justify-between w-full mt-3">
                     <div className="inline-block border-t border-black pt-1 w-56 text-center font-bold uppercase text-[9px]">
                        Accepted By {po.status !== 'pending' && po.status !== 'rejected' && po.acceptedBy ? `: ${po.acceptedBy}` : ''}
                     </div>
                  </div>
               </div>
               
               <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest absolute bottom-[10px] print:bottom-[8px] left-0 right-0">Page 2 of 2</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collaboration' && (
      <div id="discussion-area" className="print:hidden max-w-[850px] mx-auto mb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-slate-200"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Collaborative Workspace</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
         </div>
         <CommentSection targetModel="PurchaseOrder" targetId={id} />
      </div>
      )}
    </div>
  );
}
