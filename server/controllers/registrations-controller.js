'use strict';

var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var User = require('../models/user');
var secrets = require('../config/secrets');

// Show Registration Page

exports.getSignup = function(req, res){
  var form = {},
  error = null,
  formFlash = req.flash('form'),
  errorFlash = req.flash('error');

  if (formFlash.length) {
    form.email = formFlash[0].email;
  }
  if (errorFlash.length) {
    error = errorFlash[0];
  }
  res.render('signup', {form: form, error: error});
};

exports.postSignup = function(req, res, next){
  req.assert('email', 'Please sign up with a valid email.').isEmail();
  req.assert('password', 'Password must be at least 6 characters long').len(6);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    req.flash('form', {
      email: req.body.email
    });
    return res.redirect('/signup');
  }
  // calls next middleware to authenticate with passport
  passport.authenticate('signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/signup',
    failureFlash : true
  })(req, res, next);
};