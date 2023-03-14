const express = require('express');
const router = express.Router();
const catchAsync = require('../util/catchAsync');
const ExpressError = require('../util/expressError');
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//new가 아래 있으면 new는 id로 처리된다,
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, isLoggedIn, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user.id
    const newCampInfo = await newCamp.save()
    req.flash('success', 'Succesfully made a new Campground')
    res.redirect(`/campgrounds/${newCampInfo.id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const details = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //중첩 채워 넣기, 우리가 찾는 캠핑장에 리뷰 배열의 모든 리뷰를 채워 넣으라는 명령
    // * detail페이지에만 적용

    // 캠핑장을 찾고 리뷰룰 채워 넣고 각각의 리뷰에 작성자를 채워 넣고 **위 단계들**
    // 그리고 각각의 작성자를 캠핑장에 채워 넣는다 .populate('author');
    console.log(details);
    if (!details) {
        req.flash('error', "Can't find compground")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/detail', { details });
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const details = await Campground.findById(id);
    if (!details) {
        req.flash('error', "Can't find compground")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { details });
}));

router.put('/:id', validateCampground, isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const update = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'succesfully updated campground')
    res.redirect(`/campgrounds/${update.id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfullly deleted campground');
    res.redirect('/campgrounds')
}));

module.exports = router;