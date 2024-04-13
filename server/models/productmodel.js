const mongoose = require('mongoose')


const product = new mongoose.Schema({
    name: {
        type: String,
        required: true,
     
    },
    category: {
        type: String,
        required: true,
      
    },
    rate: {
        type: Number,
        required: true,
       
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
        type: Boolean,
        default: false  // Provide a default value
    },
    status:{
        type:Boolean,
        default: true ,
        require:true
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