var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var crypto = require('crypto');
var Email = require('./email');

module.exports = function(passport){

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // login
  passport.use('login', new LocalStrategy({
      usernameField: 'email',
      passReqToCallback : true
    },
    function(req, email, password, done) {

      User.findOne({ 'email' :  email },
        function(err, user) {
          if (err) return done(err);
          if (!user){
            return done(null, false, req.flash('error', 'User not found'));
          }
          user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
              var time = 14 * 24 * 3600000;
              req.session.cookie.maxAge = time; //2 weeks
              req.session.cookie.expires = new Date(Date.now() + time);
              req.session.touch();
              return done(null, user, req.flash('success', 'Successfully logged in.'));
            } else {
              return done(null, false, req.flash('error', 'Invalid Password'));
            }
          });
        }
      );
    })
  );

  passport.use('signup', new LocalStrategy({
      usernameField: 'email',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      var findOrCreateUser = function(){
        User.findOne({ email: req.body.email }, function(err, existingUser) {
          if (existingUser) {
            req.flash('form', {
              email: req.body.email
            });
            return done(null, false, req.flash('error', 'An account with that email address already exists.'));
          }
          // edit this portion to accept other properties when creating a user.
          var user = new User({
            email: req.body.email,
            password: req.body.password, // user schema pre save task hashes this password
            emailConfirmToken: crypto.randomBytes(15).toString('hex')
          });

          user.save(function(err) {
            if (err) return done(err, false, req.flash('error', 'Sorry, but an error occured while saving. Try again later'));
            var time = 14 * 24 * 3600000;
            req.session.cookie.maxAge = time; //2 weeks
            req.session.cookie.expires = new Date(Date.now() + time);
            req.session.touch();
            Email.sendSignup(req, user, function (result) {
              if(result) {
                 return done(null, user, req.flash('success', 'Thank you, your account was created. Check your emails to confirm the signup.'));
              } else {
                 return done(null, false, req.flash('error', 'Sorry, but an error occured while creating the account. Try again later'));
              }
            })
          });
        });
      };

      process.nextTick(findOrCreateUser);

    })
  );
};
