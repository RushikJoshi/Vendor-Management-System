const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { restrictToTenant } = require('../middlewares/tenant.middleware');
const {
    createClient,
    getClients,
    getClient,
    updateClient,
    deleteClient,
    createClientLogin
} = require('../controllers/clientController');

const router = express.Router();

router.use(protect);
router.use(restrictToTenant);

router
    .route('/')
    .get(authorizeRoles('admin', 'sales', 'procurement'), getClients)
    .post(authorizeRoles('admin', 'sales'), createClient);

router
    .route('/:id')
    .get(authorizeRoles('admin', 'sales', 'procurement'), getClient)
    .put(authorizeRoles('admin', 'sales'), updateClient)
    .delete(authorizeRoles('admin'), deleteClient);

router.post('/:id/create-login', authorizeRoles('admin', 'sales'), createClientLogin);

module.exports = router;
