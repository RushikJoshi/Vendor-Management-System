const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { restrictToTenant } = require('../middlewares/tenant.middleware');
const {
    createSalesOrder,
    getSalesOrders,
    getSalesOrder,
    updateSalesOrderStatus,
    paySalesOrder
} = require('../controllers/salesOrderController');

const router = express.Router();

router.use(protect);
router.use(restrictToTenant);

router
    .route('/')
    .get(authorizeRoles('admin', 'sales', 'procurement', 'client'), getSalesOrders)
    .post(authorizeRoles('admin', 'sales'), createSalesOrder);

router
    .route('/:id')
    .get(authorizeRoles('admin', 'sales', 'procurement', 'client'), getSalesOrder);

router
    .route('/:id/status')
    .put(authorizeRoles('admin', 'sales'), updateSalesOrderStatus);

router
    .route('/:id/pay')
    .post(authorizeRoles('client'), paySalesOrder);

module.exports = router;
