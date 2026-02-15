const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const passKey = (process.env.EmailKey);



const options = { service: 'gmail', 
    auth: {
        user: "moviesconvey@gmail.com",
        pass: passKey,
}}

const transporter = nodemailer.createTransport(options);


const mailer = async (req,res,next) => {
    const newOtp = crypto.randomInt(100000, 999999).toString();
    req.session.otp = newOtp
    req.session.otpExpire = Date.now() + (5 * 60 * 1000);
    const {email} = req.body;
    try{
        const info = await transporter.sendMail({
        from: '"Movies Convey" <moviesconvey@gmail.com>',
        to: `${email}`,
        subject: 'Welcome to Movies Convey! 🎞️',
        text: "Hello! Welcome to our app. We are glad to have you here.",
        html: `<div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center;">
        <div style="max-width: 450px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 30px; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
            
            <div style="margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #38bdf8;">🎬 MOVIES<span style="color: #ffffff;">CONVEY</span></span>
            </div>

            <h2 style="margin-bottom: 10px; font-size: 20px;">Verify Your Account</h2>
            <p style="color: #94a3b8; font-size: 15px; margin-bottom: 30px;">
            Welcome! Use the code below to finish setting up your Account and start tracking your favorite titles.
            </p>

            <div style="background-color: #0f172a; border: 2px dashed #38bdf8; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">${newOtp}</span>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            This code is valid for 10 minutes. <br>
            If you didn't request this, you can safely ignore this email.
            </p>

            <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px;">
            &#169; 2026 Movies Convey
            </p>
        </div>
        </div>`
        });
        console.log("Message sent:", info.messageId);
    } catch(e){
        req.flash('error', "Something went wrong!");
        return res.redirect('/register')
    }
    next();
}

const isOtp = (req,res,next)=>{
    if(!req.session.otp || Date.now() > req.session.otpExpire){
        delete req.session.otp
        delete req.session.otpExpire
        req.flash('error', 'OTP has expired. Please request new one.');
        return res.redirect('/register')
    }else{
        next();
    }
}

const validOtp = (req,res,next)=>{
    const {email, username, password} = req.body;
    if(req.session.otp !== req.body.otp){
        req.flash('error', 'Please enter a correct OTP');
        return res.render('users/authentication', {email , username, password})
    }else{
        next();
    }
}


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/registration', mailer, catchAsync(async(req, res, next) => {
    const {email, username, password, } = req.body;
    res.render('users/authentication', {email , username, password})
}));


router.post('/register', isOtp, validOtp, catchAsync(async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        console.log(user)
        const registerUser = await User.register(user, password);
        req.login(registerUser, err=> {
            if(err) return next(err);
            req.flash('success', 'Successfully registered');
            res.redirect('/');
        })
    } catch(e){
        req.flash('error', e.message)
        res.redirect('/register');
    }
}))


router.get('/login', (req,res) => {
    res.render('users/login')
})


router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req,res) => {
    req.flash('success', "Welcome Back")
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
})


router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', "Goodbye")
    res.redirect('/')
  });
});


module.exports = router;
