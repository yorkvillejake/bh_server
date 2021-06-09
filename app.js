var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const cron = require('node-cron');
const moment = require('moment');

moment.tz.setDefault('America/Cancun');

var indexRouter = require('./app_server/routes/index');
var studentsRouter = require('./app_server/routes/students');
var classesRouter = require('./app_server/routes/classes');
var instructorsRouter = require('./app_server/routes/instructors');
var scheduleRouter = require('./app_server/routes/schedule');
var reportsRouter = require('./app_server/routes/reports');
var setupRouter = require('./app_server/routes/setup');
var apiRouter = require('./app_server/controllers/api');

const { mongo_url, session_key } = require('./config');
const { checkMissedClasses } = require('./app_server/cronjob');
mongoose.connect(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true });
mongoose.connection.on('open', function() {
  console.log('Mongoose connected.');
}).on('error', function(e) {
  console.log(e);
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ encoded: true, extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: session_key, resave: false, saveUninitialized: false}));

app.use('/api', apiRouter);
app.use('/*', indexRouter);
// app.use('/admin/*', indexRouter);
// app.use('/students', indexRouter);
// app.use('/classes', indexRouter);
// app.use('/instructors', indexRouter);
// app.use('/schedule', indexRouter);
// app.use('/reports', indexRouter);
// app.use('/setup', indexRouter);


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

var task = cron.schedule('50 23 * * *', () => {
  checkMissedClasses();
});

module.exports = app;
