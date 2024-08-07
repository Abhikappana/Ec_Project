"use strict";

var mongoose = require('mongoose');

var addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData',
    required: true
  },
  addresses: [{
    name: {
      type: String
    },
    streetAddress: {
      type: String,
      description: "The street address including house/apartment number"
    },
    city: {
      type: String,
      description: "The city or locality"
    },
    state: {
      type: String,
      description: "The state, province, or region"
    },
    postalCode: {
      type: String,
      description: "The postal code or ZIP code"
    },
    country: {
      type: String,
      description: "The country"
    }
  }]
});
var Address = mongoose.model('Address', addressSchema);
module.exports = Address;