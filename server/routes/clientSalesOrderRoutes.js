const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const {
    createSalesOrder,
    getSalesOrders,
    getSalesOrder,
    updateSalesOrderStatus,
    paySalesOrder
} = require('../controllers/salesOrderController');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'superadmin', 'client'));

router
    .route('/')
    .get(getSalesOrders)
    .post(createSalesOrder);

router
    .route('/:id')
    .get(getSalesOrder);

router
    .route('/:id/status')
    .put(updateSalesOrderStatus);

router
    .route('/:id/pay')
    .post(paySalesOrder);

module.exports = router;
