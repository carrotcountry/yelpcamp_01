const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schema.js');
const methodOverride = require('method-override');
const Campground = require('./models/Campground');
const catchAsync = require('./util/catchAsync');
const ExpressError = require('./util/expressError');

mongoose.set('strictQuery', false);
// const Campground = mongoose.model('Campground', CampgroundSchema);

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

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

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//new가 아래 있으면 new는 id로 처리된다,
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground)
    const newCampInfo = await newCamp.save()
    console.log(newCampInfo)
    res.redirectt(`/campgrounds/${newCampInfo.id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const details = await Campground.findById(req.params.id);
    res.render('campgrounds/detail', { details });
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const details = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { details });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const update = await Campground.findByIdAndUpdate(id, {... req.body.campground})
    res.redirect(`/campgrounds/${update.id}`)
}))
  
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}));
  
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
}) 
  
app.use((err, req, res, next) => {
    const { statusCode = 404} = err;
    if(!err.message){
        err.message = "Something went wrong"
    }
    res.status(statusCode).render('error', {err})
    // console.log(Error.name)
})
  
app.listen(3000, () => {
    console.log('serving on port 3000')
})