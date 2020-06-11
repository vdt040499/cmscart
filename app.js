var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const validator = require('express-validator');
const fileUpload = require('express-fileupload');

const config = require('./config/database');

//Get routes
const usersRouter = require('./routes/users.route');
const pagesRouter = require('./routes/pages.route');
const adminPagesRouter = require('./routes/admin_pages.route');
const adminCatesRouter = require('./routes/admin_categories.route');
const adminProductsRouter = require('./routes/admin_products.route');

//Get Page models
const Page = require('./models/page.model');

//Get all pages to pass header.ejs
Page.find().sort({sorting: 1}).exec(function (err, pages) {
  if(err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

var app = express();

//Connect to MongoDB
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection errors'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Default  middleware
app.use(logger('dev'));
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}));

// app.use(flash());
// app.use(validator());

//Set global errors variable
app.locals.errors = null;

//Express validator middleware
app.use(validator({
  errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
              , root = namespace.shift()
              , formParam = root;

      while (namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      };
  },
  customValidators: {
      isImage: function (value, filename) {
          var extension = (path.extname(filename)).toLowerCase();
          switch (extension) {
              case '.jpg':
                  return '.jpg';
              case '.jpeg':
                  return '.jpeg';
              case '.png':
                  return '.png';
              case '':
                  return '.jpg';
              default:
                  return false;
          }
      }
  }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Routes
app.use('/', pagesRouter);
app.use('/admin/pages', adminPagesRouter);
app.use('/users', usersRouter);
app.use('/admin/categories', adminCatesRouter);
app.use('/admin/products', adminProductsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
