const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fullname: { type: String },
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    photo: { type: String },
    age: { type: Number },
    phone: { type: Number },
    role: { type: String },
    service: { type: [String], default: [] } // ✅ Store as an array of strings
});


const reservationSchema = new mongoose.Schema({
    location : {
        lat : Number,
        lng : Number
    },
    image : String,
    contact : String,
    description : String,
    notification: { type: String, default: null },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: "users" }
})


const usersCollection = mongoose.model('users', userSchema);
const reservationsCollection = mongoose.model('reservations', reservationSchema);

module.exports = {usersCollection, reservationsCollection};