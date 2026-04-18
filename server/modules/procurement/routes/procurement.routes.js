const router = require("express").Router();
const { protect } = require("../../../middlewares/auth.middleware");
const { restrictToTenant } = require("../../../middlewares/tenant.middleware");
const { authorizeRoles } = require("../../../middlewares/role.middleware");
const controller = require("../controllers/procurement.controller");

router.use(protect);
router.use(restrictToTenant);

router.get("/overview", authorizeRoles("admin", "procurement", "finance", "hr"), controller.getOverview);

router
  .route("/purchase-requests")
  .get(authorizeRoles("admin", "procurement", "finance", "hr"), controller.listPurchaseRequests)
  .post(authorizeRoles("admin", "procurement", "hr"), controller.createPurchaseRequest);

router.patch(
  "/purchase-requests/:id/approve",
  authorizeRoles("admin", "procurement", "finance"),
  controller.approvePurchaseRequest
);

router.post(
  "/purchase-requests/:id/convert-to-rfq",
  authorizeRoles("admin", "procurement"),
  controller.createRfqFromPr
);

router.get(
  "/rfqs/:rfqId/quotation-comparison",
  authorizeRoles("admin", "procurement", "finance"),
  controller.getQuotationComparison
);

router.post(
  "/quotations/:quotationId/select",
  authorizeRoles("admin", "procurement"),
  controller.selectVendor
);

router.get("/purchase-orders", authorizeRoles("admin", "procurement", "finance", "vendor"), controller.listPurchaseOrders);
router.get("/service-orders", authorizeRoles("admin", "procurement", "finance", "vendor"), controller.listServiceOrders);

router
  .route("/deliveries")
  .get(authorizeRoles("admin", "procurement", "finance", "vendor"), controller.listDeliveries)
  .post(authorizeRoles("admin", "procurement", "vendor"), controller.upsertDelivery);

router
  .route("/invoices")
  .get(authorizeRoles("admin", "procurement", "finance", "vendor"), controller.listInvoices)
  .post(authorizeRoles("admin", "procurement", "vendor"), controller.createInvoice);

router.patch("/invoices/:invoiceId/review", authorizeRoles("admin", "finance"), controller.reviewInvoice);
router.post("/invoices/:invoiceId/pay", authorizeRoles("admin", "finance"), controller.processPayment);

router.get("/payments", authorizeRoles("admin", "finance", "procurement"), controller.listPayments);
router.get("/sla-breaches", authorizeRoles("admin", "procurement", "finance"), controller.listSlaBreaches);

module.exports = router;
