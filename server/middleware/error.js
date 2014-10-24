'use strict';

module.exports = {

  notFound: function(req, res, next) {
    var err = new Error('Not Found');

    err.status = 404;
    next(err);
  },

  development: function(err, req, res, next) {
    var customError = {
      message: err.message,
      error: err
    };

    res.status(err.status || 500);
    res.format({
      json: function(){
        res.json(customError);
      },
      html: function(){
        res.render('error', {err: customError});
      }
    });
  },

  production: function(err, req, res, next) {
    var customError = {
      message: err.message || 'Not Found',
      error: false
    };

    res.status(err.status || 500);
    res.format({
      json: function(){
        res.json(customError);
      },
      html: function(){
        res.render('error', customError);
      }
    });
  }
};
