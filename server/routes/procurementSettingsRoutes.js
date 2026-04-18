const express = require('express');
const router = express.Router();
const controller = require('../controllers/procurementSettingsController');
const { protect } = require('../middlewares/auth.middleware');
const { restrictToTenant } = require('../middlewares/tenant.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.use(protect);
router.use(restrictToTenant);

router.get('/history', authorizeRoles('admin', 'procurement'), controller.getHistory);
router.post('/restore/:historyId', authorizeRoles('admin', 'procurement'), controller.restoreHistoryVersion);
router.get('/', authorizeRoles('admin', 'procurement'), controller.getSettings);
router.put('/', authorizeRoles('admin', 'procurement'), controller.updateSettings);

module.exports = router;
