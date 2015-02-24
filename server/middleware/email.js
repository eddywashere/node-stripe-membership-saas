var nodemailer = require('nodemailer');
var mailgunApiTransport = require('nodemailer-mailgunapi-transport');
var User = require('../models/user');
var secrets = require('../config/secrets');


var transporter = nodemailer.createTransport(
  mailgunApiTransport({
    apiKey: secrets.mailgun.password,
    domain: secrets.mailgun.user
}));

var config = {
  from: 'postmaster@sandboxdaaf0cb261364f07a6390025ab706114.mailgun.org',
  siteName: 'node-stripe-membership'
}

  exports.sendSignup = function (req, user, cb) {


    if(!user) {  cb(false); return ; }

var mailOptions = {
  to: user.email,
  from: config.from,
  subject: 'Confirm signup on' + config.siteName,
  text: 'You are receiving this email because you (or someone else) signed up at ' + config.siteName + '.\n\n' +
    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
    'http://' + req.headers.host + '/user/verify_email?token=' + user.emailConfirmToken + '\n\n' +
    'If you did not request this, please ignore this email and your account won\'t be actived.\n'
};
transporter.sendMail(mailOptions, function(err) {
console.log(err);
   cb(err ? false : true);

})

}
