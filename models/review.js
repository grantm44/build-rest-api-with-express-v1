'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var ReviewSchema = new mongoose.Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  postedOn: { type: Date, default: Date.now, required: true },
  rating: {
    type: Number, 
    required: true,
    min: 1,
    max: 5},
  review: String
});

module.exports = mongoose.model("Review", ReviewSchema);