const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const TitlesSchema = new Schema({
    _id : Number,
    title : String,
    year : Number,
    type : String,
});


const UserDataSchema = new Schema({
    email:{
        type : String,
        required: true,
        unique: true
    },
    userTitles:{
        wishlist:[TitlesSchema],
        watchedList:[TitlesSchema],  
    }
});

UserDataSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model("User", UserDataSchema);