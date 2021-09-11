const Review = require('./../models/reviewModel'),
  AppError = require('./../utils/appError'),
  factory = require('./handlerFactory'),
  catchAsync = require('./../utils/catchAsync');

exports.setTourUserId = (req, _, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user.id; //get user from protect middleware
  next();
};
exports.addNewReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
