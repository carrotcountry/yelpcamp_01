module.exports.isLoggedIn = (req, res, next) => {
    console.log("REQ.USER..", req.user); //로그인 되어있는지 안되어 있는지 확인 할 수 있음
    if(!req.isAuthenticated()){
        // isAuthenticated()의 역할이다. 인증된 사용자가 아니면 새로운 campgound를 추가할 수 없게 설정할 수 있다.

        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must signed in')
        return res.redirect('/login');
    } 
    next();
}