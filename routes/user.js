const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const { TitlesSchema } = require('../schemas.js')
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware.js')
const baseUrl = 'https://api.watchmode.com/v1/'
const key = (process.env.Key);
const apiKey = `?apiKey=${key}`;


const validateTitle = (req, res, next) => {
    const { error } = TitlesSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const addTitle = async (req,res,next)=> {
    const {_id} = req.body
    const url = `${baseUrl}title/${_id}/details/${apiKey}`;
    const titles = await(await fetch(url)).json();
    const {id, title, year, type} = titles
    req.body = {_id:id, title, year, type}
    next()
}


router.delete('/wishlist', isLoggedIn, catchAsync(async (req, res, next) => {
    const titleId = req.body._id
    const curUser = req.user._id
    const user = await User.findByIdAndUpdate(curUser,
        { $pull: { "userTitles.wishlist": { _id: titleId } } })
    await user.save()
    req.flash('success', 'Removed from Wishlist')
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
}))

router.delete('/watched', isLoggedIn, catchAsync(async (req, res, next) => {
    const titleId = req.body._id
    const curUser = req.user._id
    const user = await User.findByIdAndUpdate(curUser,
        { $pull: { "userTitles.watchedList": { _id: titleId } } })
    await user.save()
    req.flash('success', 'Removed from Watched')
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
}))

router.post('/wishlist', isLoggedIn, addTitle, validateTitle, catchAsync(async (req, res, next) => {
    const curUser = req.user._id
    const user = await User.findByIdAndUpdate(curUser)
    user.userTitles.wishlist.push(req.body)
    await user.save()
    req.flash('success', 'Added to Wishlist')
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
}));


router.post('/watched', isLoggedIn, addTitle, validateTitle, catchAsync(async (req, res, next) => {
    const curUser = req.user._id
    const user = await User.findByIdAndUpdate(curUser)
    user.userTitles.watchedList.push(req.body)
    await user.save()
    req.flash('success', 'Added to Watched')
    const redirectUrl = res.locals.returnTo || '/'
    res.redirect(redirectUrl);
}));


router.get('/wishlist', isLoggedIn, catchAsync(async (req, res, next) => {
    const curUser = req.user._id
    const { userTitles } = await User.findById(curUser)
    const titles = userTitles.wishlist
    const type = "Wishlist"
    res.render('users/usertitles', { titles, type, userTitles })
}));

router.get('/watched', isLoggedIn, catchAsync(async (req, res, next) => {
    const curUser = req.user._id
    const { userTitles } = await User.findById(curUser)
    const titles = userTitles.watchedList
    const type = "Watched"
    res.render('users/usertitles', { titles, type, userTitles })
}));




module.exports = router