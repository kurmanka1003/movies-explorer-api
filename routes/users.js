const router = require('express').Router();

const { getCurrentUser, updateUser } = require('../controllers/userController');

const { updateProfileValidator } = require('../middlewares/validation');

router.get('/me', getCurrentUser);
router.patch('/me', updateProfileValidator, updateUser);

module.exports = router;
