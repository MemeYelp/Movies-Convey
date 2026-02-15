const express = require('express');
const router = express.Router();
const key = (process.env.Key);
const apiKey = `?apiKey=${key}`;
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const baseUrl = 'https://api.watchmode.com/v1/'



router.get('/all/:page', catchAsync(async (req, res, next) => {
    const { page = 1 } = req.params;
    const url = `${baseUrl}list-titles/${apiKey}&limit=20&page=${page}`;
    const titles = await (await fetch(url)).json();
    if (titles.success == false) { throw new ExpressError(titles.statusMessage, titles.statusCode) }
    res.render('alltitles', { titles});
}));

router.get('/search', catchAsync(async (req, res, next) => {
    const searchValue = req.query.query;
    if (searchValue === undefined || searchValue == '') {
        return res.render('something')
    }
    const url = `${baseUrl}autocomplete-search/${apiKey}&search_value=${encodeURIComponent(searchValue)}&search_type=2`;
    const titles = await (await fetch(url)).json();
    if (titles.success == false) { throw new ExpressError(titles.statusMessage, titles.statusCode) }
    res.render('search', { titles, searchValue })
}));


router.get('/genre/:genre/:genreId/:page', catchAsync(async (req, res, next) => {
    const { genre, genreId, page = 1 } = req.params;
    const url = `${baseUrl}list-titles/${apiKey}&genres=${genreId}&limit=20&page=${page}`;
    const titles = await (await fetch(url)).json();
    if (titles.success == false) { throw new ExpressError(titles.statusMessage, titles.statusCode) }
    res.render('genre', { titles, genre, genreId });
}));

router.get('/source/:source/:source_id/:page', catchAsync(async (req, res, next) => {
    const { source_id, source, page = 1 } = req.params;
    const url = `${baseUrl}list-titles/${apiKey}&source_ids=${source_id}&limit=20&page=${page}`;
    const titles = await (await fetch(url)).json();
    if (titles.success == false) { throw new ExpressError(titles.statusMessage, titles.statusCode) }
    res.render('source', { titles, source, source_id });
}));

router.get('/:titleId', catchAsync(async (req, res, next) => {
    const { titleId } = req.params;
    const url = `${baseUrl}title/${titleId}/details/${apiKey}&append_to_response=sources&regions=US,IN`;
    const title = await (await fetch(url)).json();
    console.log(title)
    if (title.success == false) { throw new ExpressError(title.statusMessage, title.statusCode) }
    res.render('title', { title});
}));



module.exports = router;