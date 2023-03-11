//npm
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override');

//error handeling
const ExpressError = require('./util/expressError');
const catchAsync = require('./util/catchAsync');

// routes
const campgrounds = require('./routes/campground');
const reviews = require('./routes/reviews');

//schema
const Campground = require('./models/Campground');
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./schema.js');





// const { use } = require('./routes/campground');

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


app.use('/campgrounds', campgrounds )
app.use('/campgrounds/:id/reviews', reviews )

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