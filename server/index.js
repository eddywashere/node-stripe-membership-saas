'use strict';

var express = require('express');
var swig = require('swig');
var subdomainOffset = process.env.SUBDOMAIN_OFFSET || 0;
var secrets = require('./config/secrets');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')({ session: session });
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var compress = require('compression')();
var lodash = require('lodash');
// var Authentication = require('./authentication');
var expressValidator = require('express-validator');
var errorHandler = require('./middleware/error');
var viewHelper = require('./middleware/view-helper');
var flash = require('express-flash');
var cors = require('cors');
var corsOptions = {
  origin: '*'
};
var staticDir;

// setup db
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

var corsOptions = {
  origin: '*'
};

// express setup
var app = express();

if (app.get('env') === 'production') {
  app.locals.production = true;
  swig.setDefaults({ cache: 'memory' });
  staticDir = path.join(__dirname + '/../public');
} else {
  app.locals.production = false;
  swig.setDefaults({ cache: false });
  staticDir = path.join(__dirname + '/../public');
}

// This is where all the magic happens!
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.locals._ = lodash;
app.locals.stripePubKey = secrets.stripeOptions.stripePubKey;


app.use(favicon(path.join(__dirname + '/../public/favicon.ico')));
app.use(logger('dev'));

app.use(compress);
app.use(bodyParser());
app.use(expressValidator());
app.use(cookieParser());

app.use(express.static(staticDir));
if(app.get('env') !== 'production'){
  app.use('/styles', express.static(__dirname + '/../.tmp/styles'));
  // app.use('/', routes.styleguide);
}

app.use(session({
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 1000 // 1 minute
  },
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));

// setup passport authentication
app.use(passport.initialize());
app.use(passport.session());

// other
app.use(flash());
app.use(cors(corsOptions));

var passportMiddleware = require('./middleware/passport');
passportMiddleware(passport);

// setup view helper
app.use(viewHelper);

// setup routes
var routes = require('./routes');
routes(app, passport);

/// catch 404 and forwarding to error handler
app.use(errorHandler.notFound);

/// error handlers
if (app.get('env') === 'development') {
  app.use(errorHandler.development);
} else {
  app.use(errorHandler.production);
}

module.exports = app;
