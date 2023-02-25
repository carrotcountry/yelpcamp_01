const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//단축키 역할 추후 mongoose.Schema의 사용 빈도가 잦으므로


// 스키마 만들 때 new ~ 부분

const CampgroundSchema = new Schema({ 
    title: String,
    image:String,
    price: Number,
    description: String,
    location: String
});


const Campground = mongoose.model('Campground', CampgroundSchema);

 module.exports = Campground
 