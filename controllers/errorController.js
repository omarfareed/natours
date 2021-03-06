const AppError = require('./../utils/appError');
const handleCastErrorDB = err => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token, please login again', 401);
const handleJWTExpiredError = () =>
  new AppError('your login time is out, please login again', 401);
const handleDuplicateErrorDB = err => {
  return new AppError(
    `Duplicated name ${err.keyValue.name} already used, try another one`,
    err.statusCode
  );
};
const handleValidationError = err => {
  const errors = Object.values(err.errors).map(er => er.message);
  return new AppError(errors, err.statusCode);
};
const sendErrorForDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  res
    .status(err.statusCode)
    .set('Content-Security-Policy', '*')
    .render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
};
const sendErrorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
      });

    //For developers
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    });
  }
  if (err.isOperational)
    return res
      .status(err.statusCode)
      .set('Content-Security-Policy', '*')
      .render('error', {
        title: 'Something went wrong',
        msg: err.message
      });

  //For developers
  return res
    .status(500)
    .set('Content-Security-Policy', '*')
    .render('error', {
      title: 'Something went wrong',
      msg: 'please try again later'
    });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 505;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateErrorDB(error);
    else if (error.name === 'ValidationError')
      error = handleValidationError(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError();
    sendErrorProduction(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, req, res);
  }
};
