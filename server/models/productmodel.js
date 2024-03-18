const mongoose = require('mongoose')


const product = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    rate: {
        type: Number,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        trim: true,
    },
    image: {
        type: Array,
        required: true,
        trim: true,
    },
    hide: {
        type: Number,
        required: true,
        trim: true,
    },
    offer: {
        type: Number
    },
    discountAmount: {
        type: Number
    },
    catOffer: {
        type: Number
    }
});

const productData = new mongoose.model('productData', product)
module.exports = productData