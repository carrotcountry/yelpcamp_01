const express = require('express');             
const router = express.Router({ mergeParams: true });
//mergeParams은 campgorunds에서는 문제가 되지 않는다. 캠핑장 라우트에 필요한 Id를 경로에 모두 정의 했고 
// campgrounds를 접두사로 사용하기 때문이다.
// 하지만  (app.js 미들웨어 ) -> app.use('/campgrounds/:id/reviews', reviews )  app.js  에서 라우트를 설정할 때 정의한 더 많은 매개 변수에
// 접근하려면 mergeParams를 true로 지정하면 된다.
// 이렇게 하지 않으면 req.params는 {} 빈 값이 출력됨


const catchAsync = require('../util/catchAsync');
const ExpressError = require('../util/expressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user.id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully posted Your review')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted Your review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;