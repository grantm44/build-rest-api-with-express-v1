'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
var bcrypt = require('bcrypt');
var validator =  require('validator');
//var salt = bcrypt.genSaltSync(10);

var UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  emailAddress: {
    type: String,
    unique: [true, 'Email already in use'],
    validate: {
      validator: function(email){
        return validator.isEmail(email);
      },
      message: 'Not a valid email address'
    },
    required:[true, 'Not a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function(password){
        return password === this.confirmPassword
      },
      message: "Passwords do not match"
    }
  },
  confirmPassword: String
});

//check for unique user by email
UserSchema.path('emailAddress').validate(function(value, respond){
  this.constructor.find({emailAddress: value}, function(err, user){
    if(user.length == 0){
      return respond(true)
    }
    return respond(false);
  });
}, 'Already exists');

//hash password before saving new user
UserSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, 8, function(err, hash){
    if(err) return next(err);
    user.password = hash;
    user.confirmPassword = hash;
    next();
  })
});

module.exports = mongoose.model("User", UserSchema);

/*if(validator.isEmail(email)){
  User.find({emailAddress: email}, function(err, docs){
    return docs.length === 0;
  });
}
else{
  return false;
}*/