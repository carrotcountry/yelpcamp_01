const express = require('express');
const router = express.Router();
const catchAsync = require('../util/catchAsync');
const ExpressError = require('../util/expressError');
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schema.js');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}




router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//new가 아래 있으면 new는 id로 처리된다,
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    const newCampInfo = await newCamp.save()
    res.redirectt(`/campgrounds/${newCampInfo.id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const details = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/detail', { details });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const details = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { details });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const update = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${update.id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}));

module.exports = router;