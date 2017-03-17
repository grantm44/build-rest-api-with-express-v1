var auth = require('basic-auth');
var models = require('../models');
var bcrypt = require('bcrypt');

var User = models.user;

module.exports = {

  //catch 404 error and forward to global error handler
  notFound: function(req, res, next){
    var err = new Error('Not Found');
    err.status = 404;
    res.send(err);
  },

  //if user is signed in get credentials and search for user
  basicAuth: function(req, res, next){
    var credentials = auth(req);
      if(credentials){
        
        var search = {emailAddress: credentials.name};
        User.findOne(search).then(function(user){
      
            bcrypt.compare(credentials.pass, user.password, function(err, res){
              if(res === true){
                //save user to req
                req.user = user;
                next();
              }else{
                next(error);
              }
            });
        }).catch(function(error) {next(error)});
      
      }else{
        var err = new Error('Not authorized, please log in');
        next(err);
      }
  },

  format: function(errObj){
    //console.log(errObj);
    var newErrors = {};
    newErrors.status = 400;
    newErrors.message = errObj.message;
    newErrors.errors = {
      property: []
    }
    for(err in errObj.errors){
      var t = errObj.errors[err];
      var prop = {
        code: 400,
        message: t.message
      };

      newErrors.errors.property.push(prop);
    }
    return newErrors;
  }
    //{ "message": "Validation Failed", "errors": { "property": [ { "code": "", "message": "" }, ... ] } }*/
};//end


