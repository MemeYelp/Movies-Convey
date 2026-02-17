const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const { sendOtpEmail } = require('../utils/emailsend');


const isOtp = (req, res, next) => {
    if (!req.session.otp || Date.now() > req.session.otpExpire) {
        delete req.session.otp
        delete req.session.otpExpire
        req.flash('error', 'OTP has expired. Please request new one.');
        return res.redirect('/register')
    } else {
        next();
    }
}

const validOtp = (req, res, next) => {
    const { email, username, password } = req.body;
    if (req.session.otp !== req.body.otp) {
        req.flash('error', 'Please enter a correct OTP');
        return res.render('users/authentication', { email, username, password })
    } else {
        next();
    }
}


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/registration', catchAsync(async (req, res, next) => {
    const { email, username, password, } = req.body;
    try {
        const newOtp = await sendOtpEmail(email);
        req.session.otp = newOtp
        req.session.otpExpire = Date.now() + (5 * 60 * 1000)
    } catch (err) {
        console.log(err)
        req.flash('error', "Something went wrong!");
        return res.redirect('/register')
    }
    res.render('users/authentication', { email, username, password })
}));


router.post('/register', isOtp, validOtp, catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('success', 'Successfully registered');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register');
    }
}))


router.get('/login', (req, res) => {
    res.render('users/login')
})


router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', "Welcome Back")
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
})


router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye")
        res.redirect('/')
    });
});

module.exports = router;