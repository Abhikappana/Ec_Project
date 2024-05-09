"use strict";

var mongoose = require('mongoose');

var _require = require('os'),
    type = _require.type;

var wishlist = require('./wishlistmodel');

var product = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
  },
  properties: [{
    color: {
      type: String
    },
    size: {
      type: String
    },
    price: {
      type: Number
    },
    stockQuantity: {
      type: Number
    }
  }],
  rate: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: Array,
    required: true,
    trim: true
  },
  wishlist: {
    type: Boolean,
    "default": false // Provide a default value

  },
  status: {
    type: Boolean,
    "default": true,
    require: true
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
var productData = new mongoose.model('productData', product);
module.exports = productData;