const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');

const {
    register,
    login,
    logout,
    isAuthenticated,
    getUser,
    edit,
    admin,
    makeAdmin,
    checkPassword,
    changePassword,
    getAllAttributes
} = require('../controllers/users');

router.post('/register', register);
router.post('/login', passport.authenticate('local', {session: false}), login);
router.post('/logout', logout);
router.get('/authenticated', passport.authenticate('jwt', {session: false}), isAuthenticated);
router.get('/getCurrent', passport.authenticate('jwt', {session: false}), getUser);
router.put('/edit', passport.authenticate('jwt', {session: false}), edit);
router.put('/changePassword', passport.authenticate('jwt', {session: false}), checkPassword, changePassword);

router.get('/attributes', getAllAttributes);

module.exports = router;