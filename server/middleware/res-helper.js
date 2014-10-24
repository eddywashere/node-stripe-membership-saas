'use strict';

exports.setRender = function(view){
  return function(req, res, next){
    if(view){
      req.render = view;
    }
    next();
  };
};

exports.setRedirect = function(options){
  return function(req, res, next){
    if(options){
      req.redirect = options;
    }
    next();
  };
};