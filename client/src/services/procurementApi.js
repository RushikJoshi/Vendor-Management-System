import api from "./api";

const procurementApi = {
  getOverview: () => api.get("/procurement/overview"),
  getVendorDashboardStats: () => api.get("/vendors/me/stats"),

  listPRs: (params = {}) => api.get("/procurement/purchase-requests", { params }),
  createPR: (payload) => api.post("/procurement/purchase-requests", payload),
  approvePR: (id, payload) => api.patch(`/procurement/purchase-requests/${id}/approve`, payload),
  convertPRToRFQ: (id, payload) => api.post(`/procurement/purchase-requests/${id}/convert-to-rfq`, payload),

  getComparison: (rfqId) => api.get(`/procurement/rfqs/${rfqId}/quotation-comparison`),
  selectVendor: (quotationId) => api.post(`/procurement/quotations/${quotationId}/select`),

  listPOs: () => api.get("/procurement/purchase-orders"),
  listSOs: () => api.get("/procurement/service-orders"),
  listDeliveries: () => api.get("/procurement/deliveries"),
  upsertDelivery: (payload) => api.post("/procurement/deliveries", payload),

  listInvoices: () => api.get("/procurement/invoices"),
  createInvoice: (payload) => api.post("/procurement/invoices", payload),
  reviewInvoice: (invoiceId, payload) => api.patch(`/procurement/invoices/${invoiceId}/review`, payload),
  payInvoice: (invoiceId, payload) => api.post(`/procurement/invoices/${invoiceId}/pay`, payload),

  listPayments: () => api.get("/procurement/payments"),
  listSlaBreaches: () => api.get("/procurement/sla-breaches"),
};

export default procurementApi;
