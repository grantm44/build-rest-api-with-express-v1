'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  description: {
    type: String,
    required: true
  },
  estimatedTime: String,
  materialsNeeded: String,
  steps: [{
      stepNumber: Number,
      title: {required: true, type: String},
      description: {required: true, type: String}
    }],
  reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

//create pre save hook to count step number (index + 1) and atleast 1 step exists
CourseSchema.pre('save', function(next){
  var course = this;
  var length = course.steps.length;
  if(length === 0){
    var err = new Error('Atleast 1 step is required');
    err.status = 301;
    next(err);
  }else{
    course.steps.forEach(function(step, i){
      step.stepNumber = i + 1;
    });
  }
  next();
});

//Returns avg of all review ratings for a specified course, rounded to nearest whole number
CourseSchema.virtual('overallRating').get(function(){
  var rate = 0;
  
  for(var i = 0; i < this.reviews.length; i++){
    rate += this.reviews[i].rating;
  }
  rate = rate / this.reviews.length;
  Math.round(rate);
  return rate;
});

module.exports = mongoose.model('Course', CourseSchema);