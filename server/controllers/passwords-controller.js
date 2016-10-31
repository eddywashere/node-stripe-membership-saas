'use strict';

var nodemailer = require('nodemailer');
var mailgunApiTransport = require('nodemailer-mailgunapi-transport');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/user');
var secrets = require('../config/secrets');

// edit password

exports.postNewPassword = function(req, res, next){
  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! Your password has been changed.' });
      res.redirect(req.redirect.success);
    });
  });
};

// show forgot password page

exports.getForgotPassword = function(req, res){
  if (req.isAuthenticated()) {
    return res.redirect(req.redirect.auth);
  }
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
  res.render(req.render, {
    title: 'Forgot Password',
    form: form,
    error: error
  });
};

// post forgot password will create a random token,
// then sends an email with reset instructions

exports.postForgotPassword = function(req, res, next){
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('form', {
      email: req.body.email
    });
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('form', {
            email: req.body.email
          });
          req.flash('error', 'No account with that email address exists.');
          return res.redirect(req.redirect.failure);
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport(mailgunApiTransport(secrets.mailgun));

      var mailOptions = {
        to: user.email,
        from: 'noreply@node-stripe-membership.herokuapp.com',
        subject: 'Reset your password on node-stripe-membership.herokuapp.com',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect(req.redirect.success);
  });
};

exports.getToken = function(req, res){
  if (req.isAuthenticated()) {
    return res.redirect(req.redirect.failure);
  }
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

  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect(req.redirect.failure);
      }
      res.render(req.render, {
        title: 'Password Reset',
        token: req.params.token,
        form: form,
        error: error
      });
    });
};

exports.postToken = function(req, res, next){
  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect(req.redirect.failure);
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            var time = 14 * 24 * 3600000;
            req.session.cookie.maxAge = time; //2 weeks
            req.session.cookie.expires = new Date(Date.now() + time);
            req.session.touch();

            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport(mailgunApiTransport(secrets.mailgun));

      var mailOptions = {
        to: user.email,
        from: 'noreply@node-stripe-membership.herokuapp.com',
        subject: 'Your node-stripe-membership.herokuapp.com password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect(req.redirect.success);
  });
};