//npm
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

//error handeling
const ExpressError = require('./util/expressError');
const catchAsync = require('./util/catchAsync');

// routes
const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/reviews');

//schema
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./schema.js');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/yelp-camp", {});

//오류를 확이낳고 오류 없이 제대로 열렸다면 
// 연결됐다는 문구 출력

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
//주어진 이벤트가  생성될 때 실행할 콜백이다.
//db.on('error', 콜백함수)은 error 이벤트가 발생할 때마다 콜백함수가 호출됨을 의미한다.
//db.once('open', 콜백함수)는 사용하면 이벤트가 한 번만 호출됨을 의미하며, mongodb에 대한 연결이 열려 있을 때, 즉 연결이 성공하면 콜백함수가 호출된다.


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))


app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbebettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        HttpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session(sessionConfig));
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// 세션에 저장할지 않할지 지정하는 단계 



app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
    //위에전역으로 나갈 수 있는 global 변수 인 듯
})


app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'jaeyoon@gmail.com', username: 'jaeyoon' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser)
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home');
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 404 } = err;
    if (!err.message) {
        err.message = "Something went wrong"
    }
    res.status(statusCode).render('error', { err })
    // console.log(Error.name)
})

app.listen(3000, () => {
    ('serving on port 3000')
})