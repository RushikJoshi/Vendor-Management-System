const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
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
router.use(authorizeRoles('admin', 'superadmin'));

router
    .route('/')
    .get(getClients)
    .post(createClient);

router
    .route('/:id')
    .get(getClient)
    .put(updateClient)
    .delete(deleteClient);

router.post('/:id/create-login', createClientLogin);

module.exports = router;
