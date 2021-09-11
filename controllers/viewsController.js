const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res
    .status(200)
    .set('Content-Security-Policy', '*')
    .render('overview', {
      title: 'Title',
      tours
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  // console.log(hello);
  if (!tour) return next(new AppError('There is no tour with that name', 404));
  // tour.name = 'omar';
  // console.log(tour.reviews);
  //   tour.guides = tour.guides.map( async el => {
  //       const user = await User.findById(el);
  //       console.log(user);
  //       return user;
  //   } );
  //   console.log(tour.guides);
  res
    .status(200)
    .set('Content-Security-Policy', '*')
    .render('tour', {
      title: 'The Forest Hiker Tour',
      tour
    });
});
exports.login = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', '*')
    .render('login', {
      title: 'log into your account'
    });
});
exports.showMe = catchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', '*')
    .render('account', {
      title: 'my profile'
    });
});
