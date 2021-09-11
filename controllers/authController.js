const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require(`./../models/userModel`);
const catchAsync = require(`./../utils/catchAsync`);
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const filterObj = (obj, ...arguments) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (arguments.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    user
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get('host')}/me`; 
  const email = new Email(newUser , url);
  await email.sendWelcome();
  createToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  console.log('here');
  const { email, password } = req.body;
  // 1) check for email and password exist
  if (!email || !password)
    return next(new AppError('please enter email and password', 400));
  console.log('new');
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  //instance method
  // return res.json({ password, p: user.password });
  console.log(password);
  // console.log(await user.correctPassword(password, user.password));
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('incorrect email or password', 401));
  createToken(user, 201, res);
});
exports.protect = catchAsync(async (req, res, next) => {
  // NOTE:
  // req.headers contain headers that you sent
  // console.log(req.user);
  const { authorization } = req.headers;
  // 1) get the token and check it
  // console.log(authorization);

  let token;
  // console.log(authorization);
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    next(
      new AppError(
        'the user is not logged in , log in and refresh the page',
        401
      )
    );
  // console.log(token);
  // console.log(_ , token);
  // 2) validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // console.log(decoded);
  // 3) check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) next(new AppError('your account has been deleted', 401));
  // 4) check if the password doesn't changed
  if (currentUser.changedPasswordAfter(decoded.iat /* expired time */)) {
    return next(
      new AppError(
        'user recently changed the password , please login again',
        401
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) return next();
    // 2) validate token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    // 3) check if the user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();
    // 4) check if the password doesn't changed
    if (currentUser.changedPasswordAfter(decoded.iat /* expired time */))
      return next();
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  console.log(req.user);
  if (!roles.includes(req.user.role))
    return next(
      new AppError(
        "permission denied you aren't allowed to perform this action",
        403
      )
    );
  next();
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTED email
  // console.log('iam here');
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user)
    return next(new AppError('there is no user with this email address', 404));
  // 2) generate random token
  const resetToken = user.createPasswordResetToken();
  // NOTE: because you edit this in the user in the function above ((createPas...))
  await user.save({ validateBeforeSave: false });
  // next();
  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? reset it from ${resetURL}.\n`;

  try {
    // await sendEmail({
    //   email: user.email, // req.body.email
    //   subject: 'password reset token valid for 10 minutes',
    //   message
    // });
    res.status(200).json({
      status: 'success',
      message: `token sent to your email ==> ${user.email}`
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error on sending the email,please try later')
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }
  });

  console.log('user');
  if (!user) return next(new AppError('Token is invalid or has Expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save({ validateBeforeSave: true });

  createToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('omar');
  const user = await User.findById(req.user.id).select('+password');
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    console.log('iam');
    return next(new AppError('you have to login first', 403));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  console.log('here');
  await user.save({ validateBeforeSave: true });
  // NOTE: we don't use findByIdAndUpdate() ==> because validator and pre('save')
  // works only with create and save
  createToken(user, 200, res);
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if user post password
  console.log(req.file);
  console.log(req.body);
  if (req.body.password || req.body.passwordConfirm)
    return nex(new AppError("you can't change password here", 400));
  // 2) update user document
  console.log(req.user);
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  console.log('here reach');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });
  // await user.save({ validateBeforeSave: true });
  res.status(200).json({ status: 'success', user: updatedUser });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  // 2) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    active: false
  });
  // await user.save({ validateBeforeSave: true });
  res.status(204).json({ status: 'success', data: null });
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
