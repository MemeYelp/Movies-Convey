const express = require('express');
const router = express.Router();
const key = (process.env.Key);
const apiKey = `?apiKey=${key}`;
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const baseUrl = 'https://api.watchmode.com/v1/'


router.get('/', catchAsync(async (req, res, next) => {
    const url = `${baseUrl}list-titles/${apiKey}&limit=20&sort_by=popularity_desc`;
    const titles = await (await (fetch(url))).json();
    if (titles.success == false) { throw new ExpressError(titles.statusMessage, titles.statusCode) }
    res.render('home', { titles });
}));


router.get('/whatismycurrentapitokenleft', catchAsync(async (req, res, next) => {
    const url = `${baseUrl}status/${apiKey}`;
    const data = await (await fetch(url)).json();
    req.flash('error', `Left:- ${data.quota-data.quotaUsed} / Total :-${data.quota} / Used :- ${data.quotaUsed}`)
    throw new ExpressError()
}))







module.exports = router;