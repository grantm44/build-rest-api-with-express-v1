'use strict';

var express = require('express');
var router = express.Router();
var mid = require('../middleware');
var mongoose = require('mongoose');
var models = require('../models');
var Course = models.course;
var Review = models.review;
var User = models.user;



//GET all courses - course _id and title
router.get('/api/courses', function(req, res, next){
  Course.find({}, '_id title').exec(function(err, courses){
    if(err) return next(err);
    var course = {};
    course.data = courses;
    res.json(course);
  });                                                                      
});

//GET course by id
router.get('/api/courses/:id', function(req, res, next){
  
  Course.findById(req.params.id).
  populate('user', 'fullName').
    populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'fullName'
      }
    }).exec(function(err, doc){
      if(err) return next(err);

      res.json({
        data: [doc.toJSON({virtuals: true})]
      });
    });
});

//POST creates a course
router.post('/api/courses', mid.basicAuth, function(req, res, next){
  var course = new Course(req.body);
  course.steps.forEach(function(step, i){
    step.stepNumber = i + 1;
  });

  console.log(course);
  course.save(function(err){
    if(err) return next(err);
    res.redirect('/');
  });
});

//PUT updates a course
router.put('/api/courses/:id', mid.basicAuth, function(req, res, next){
  
  Course.update({_id: req.params.id}, req.body, {runValidators: true}, function(err){
    if(err) next(err);
  });
  res.status(204);
  res.location('/courses/');
  res.end();
});

//GET return currently authenticated user
router.get('/api/users', mid.basicAuth, function(req, res, next){
  var authUser = {};
  authUser.data = [];
  authUser.data.push(req.user);
  //console.log(authUser);
  res.json(authUser);
});

//POST creates a user, sets Location header to '/'
router.post('/api/users', function(req, res, next){
    User.create(req.body, function(err){
       
      if(err){
        err = mid.format(err);
        return next(err);
      }

      res.redirect('/');
    });
});

//POST create a review for the course selected
router.post('/api/courses/:courseId/reviews', mid.basicAuth, function(req, res, next){
  var review = new Review(req.body);
  review.user = req.user._id;
  console.log(review);
  
  Course.findById(req.params.courseId).exec(function(err, course){
    
    course.reviews.push(review._id);
    course.save(function(err, updated){
      if(err) next(err);
    });
  });
  
  review.save(function(err){
    if(err) return next(err);
  });
  res.redirect('/api/courses/' + req.params.courseId);
});

//DELETE delete the specified review many review to one course
router.delete('/api/courses/:courseId/reviews/:id', mid.basicAuth, function(req, res, next){
  
  Course.findById(req.params.courseId).populate('reviews').then(function(course){
    //console.log(course);
    for(var i = 0; i < course.reviews.length; i++){
      var areview = course.reviews[i];
      if(areview._id == req.params.id){
        var found = areview;
      }
    }

    var courseowner = course.user.toString();
    var authUser = req.user._id.toString();
    var reviewOwner = found.user.toString();

    if(courseowner == authUser || reviewOwner == authUser){

      Review.findOneAndRemove({ _id: req.params.id}).exec(function(err, removed){
        if(err) next(err);
        Course.findByIdAndUpdate(
        req.params.courseId,
        {$pull: {reviews: req.params.id}},
        {new: true},
        function(err, numberAffected){
          if(err) next(err);
          res.status(204);
          res.location('/courses/'+ req.params.courseId+'/reviews/'+ req.params.id);
          res.end();
        });
      });
    
    }else{
      var err = new Error('Not authorized');
      err.status = 304;
      return next(err);
    }
  });


});
  

module.exports = router;