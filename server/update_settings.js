const mongoose = require('mongoose');
const ProcurementSettings = require('./models/ProcurementSettings');
require('dotenv').config();

const update = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const settings = await ProcurementSettings.findOne({});
    if (settings) {
      if (!settings.PO) {
        settings.PO = new Map();
      }
      settings.set('PO.generalTerms', [
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
      ]);
      settings.set('PO.poTerms', [
            { term: 'AGAINST FORM NO', desc: 'NOT APPLICABLE' },
            { term: 'TEST CERTIFICATE', desc: 'REQUIRED' },
            { term: 'TRANSPORTATION', desc: 'INCLUDED' },
            { term: 'BRAND/SUPPORT/WARRANTY', desc: 'YES' }
      ]);
      settings.markModified('PO');
      await settings.save();
      console.log('Updated successfully');
    } else {
      console.log('No settings found in DB');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};
update();
