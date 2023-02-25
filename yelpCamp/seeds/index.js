const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedhelper')
const Campground = require('../models/Campground')
mongoose.set('strictQuery',false);


// node 할 때만 실행하는 코드 node (-i -e "$(< seeds/index.js))"
//근데 얘는 데이터베이스 종료가 진행되지 않음 왠지 모르겠음
// const mongoose = require('mongoose');
// const cities = require('./seeds/cities')
// const {places, descriptors} = require('./seeds/seedhelper')
// const Campground = require('./models/Campground')
// mongoose.set('strictQuery',false);


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

//이 파일은 데이터 베이스에 시드하고 싶을 떄 마다 
//Node 앱과는 별도로 실행할 것 

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++){
        const rand1000 = Math.floor((Math.random()) * 1000)
        const price = Math.floor((Math.random()) * 20) + 10
        const camp = new Campground ({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://source.unsplash.com/collection/483251`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas repellat ullam harum dolores corporis beatae, voluptate ratione sed aut !',
            price: price
        })
        await camp.save()
    }
}
seedDB().then(()=> {
    mongoose.connection.close().then(()=>{
        console.log('bye')
    })
});
