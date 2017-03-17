'use strict';

// load modules
var express = require('express');
var morgan = require('morgan');
var jsonParser = require('body-parser').json;
//require('../models');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/rating');

var seeder = require('mongoose-seeder');
var data = require('./data/data.json');
var routes = require('./api.routes.js');
var mid = require('../middleware');

var app = express();

var db = mongoose.connection;

db.on('error', function(err){
  console.error("connection error:", err);
});

db.once('open', function(){
  seeder.seed(data).then(function(err, dbData){
    console.log('Stored');
  }).catch(function(err){
    console.error("Data not stored in db:", err);
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));
app.use(jsonParser());
// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));
app.use('/', routes);

//app.use(mid.notFound);
//app.use('/api/courses', mid.validateCourse);

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  console.log(err);
  res.json(err);
})

// start listening on our port
var server = app.listen(app.get('port'), function() {
  console.log('Express server is listening on port ' + server.address().port);  
});
