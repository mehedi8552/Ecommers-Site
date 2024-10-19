const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'User',
        // required: true,
    },
    tran_id:{
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
    },
    status:{
        type: String,
        // required: true,
    },
    cus_email:{
        type: String,
        // required: true,
    },
    price: {
        type: Number,
        // required: true,
    },
    product_name:{
        type: String,
        // required: true,
    },
    tran_id:{
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model('order', orderSchema);
module.exports = Order;
