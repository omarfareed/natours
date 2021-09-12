const express = require('express'),
  app = express(),
  morgan = require('morgan'),
  rateLimit = require('express-rate-limit'),
  helmet = require('helmet'),
  mongoSanitize = require('express-mongo-sanitize'),
  xss = require('xss-clean'),
  hpp = require('hpp'),
  Tour = require('./models/tourModel'),
  // tourController = require('./controllers/tours-controller'),
  compression = require('compression'),
  userRouter = require('./routers/users-routers'),
  tourRouter = require('./routers/tours-routers'),
  reviewRouter = require('./routers/reviews-routers'),
  bookingRouter = require('./routers/bookingRoutes'),
  viewsRouter = require('./routers/viewsRouter'),
  appError = require(`${__dirname}/utils/appError`),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  globalErrorHandler = require('./controllers/errorController');
// 1] Middlewares
// added new line
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 3600000,
  message: 'too many requests in one hour'
});
// limit requests
app.use('/api', limiter);
// read JSON FILES
app.use(express.json());
app.use(cookieParser());
// NO SQL ATTACK
app.use(mongoSanitize());
// HTML ATTACK
app.use(xss());
// PARAMETER pollution
app.use(
  hpp({
    // allow some duplicate fields
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.use(compression());
if (process.env.MODE_ENV === 'development') app.use(morgan('dev'));
// app.param('id', tourController.checkID);
app.use('/', viewsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// Must be at the end of all routes
app.all('*', (req, res, next) => {
  // NOTE: it automatically knows that it's error and send it tot error middle ware
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// using 4 arguments means that it's an error handling middleWare
app.use(() => {
  console.log('hey! iam here');
});
app.use(globalErrorHandler);
module.exports = app;
