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

//Returns avg of all review ratings for a specified course, rounded to nearest whole number
CourseSchema.virtual('overallRating').get(function(){
  var rate;
  for(review in this.reviews){
    var x = review.rating;
    rate += x;
  }
  rate = rate / this.reviews.length;
  Math.round(rate);
  return rate;
});

module.exports = mongoose.model('Course', CourseSchema);