'use strict';

// This controller handles setting/clearing sessions when
// logging in and out.

var passport = require('passport');

exports.postLogin = function(req, res, next){
  req.assert('email', 'Please sign up with a valid email.').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);

  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }
  // this middleware can be found in /server/middleware/passport.js
  // re: passport.use('login', ...);
  passport.authenticate('login', {
    successRedirect: req.redirect.success,
    failureRedirect: req.redirect.failure,
    failureFlash : true
  })(req, res, next);
};

exports.logout = function(req, res){
  req.logout();
  req.session.cookie.expires = 60 * 1000; // 1 minute
  req.flash('message','Successfully logged out.');
  res.redirect(req.redirect.success);
};