const express = require('express');
const router = express.Router();
const catchAsync = require('../util/catchAsync')
const User = require('../models/user');
const passport = require('passport')
const { isLoggedIn } = require('../middleware')

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register',catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
})


router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true } /* 전략?(위치) 명시해주기 위헤 local을 입력하는데 여러 개를 설정할 수 있다. (google, tweet 등 가능)) */), (req, res) => {
    // passport.authenticate 
    // failureRedirect: '/login' 로그인 실패를 대비해 /login 페이지 로 넘김
    req.flash('success', 'Welcome Back')
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', 'Goodbye!');
            res.redirect('/campgrounds');
        }
    });
});
// logout 상태에서도 logout을 누르면 goodbye가 떴는데 수정해서 logout 상태에서 logout을 누르면 login 먼저하라는 알하는 flash 가 뜨는 것으로 설정했다. 


module.exports = router;

