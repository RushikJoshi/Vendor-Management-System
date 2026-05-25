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
  getVendorStatementForAdmin: (vendorId) => api.get(`/procurement/vendor-statement/${vendorId}`),

  // Vendor Workflow Actions
  acceptPO: (id) => api.patch(`/procurement/purchase-orders/${id}/accept`),
  rejectPO: (id, payload) => api.patch(`/procurement/purchase-orders/${id}/reject`, payload),
  getVendorPayments: () => api.get("/procurement/vendor-payments"),
  getVendorStatement: () => api.get("/procurement/vendor-statement"),

  // Generic Comments
  addComment: (payload) => api.post("/procurement/comments", payload),
  getComments: (targetModel, targetId) => api.get(`/procurement/comments/${targetModel}/${targetId}`),
  getAllComments: () => api.get("/procurement/comments/all"),

  // SLM / Performance
  submitPerformanceReview: (payload) => api.post("/slm/performance/review", payload),
  getVendorPerformance: (vendorId) => api.get(`/slm/performance/vendor/${vendorId}`),
};

export default procurementApi;
