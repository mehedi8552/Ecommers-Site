const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // "name":"Md Hasan", "email":"mehedi@gmail.com", "password":"test@123", "role":"user" 
    name: {
        type: String,
        // required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('TestUser', userSchema);
module.exports = User;
