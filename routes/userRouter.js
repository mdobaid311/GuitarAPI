const express = require('express');
const config = require('../config/userConfig');
const { insertUserInfo, getUsersInfo, userLogin, userLogout } = require('../controllers/userController');
const session = require('express-session');
const router = express.Router();


// user_route.use(session({secret:config.sessionSecret}));

router.get('/', getUsersInfo);
router.post('/', insertUserInfo);
router.post('/login', userLogin);
router.get('/logout', userLogout);

module.exports = router;