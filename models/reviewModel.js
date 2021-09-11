const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must added']
    },
    rating: {
      type: Number,
      required: [true, 'you must add a review'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// NOTE:
// UNDERSTAND: static method
reviewSchema.statics.calcAvgRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: Math.round(stats[0].avgRating * 10) / 10
  });
};
// reviewSchema.pre('update)
// NOTE:
// post because we want to make caculations after saving the document
reviewSchema.post('save', function() {
  // NOTE:
  // this refer to current review
  // so it's constructor will be the model
  // console.log('here');
  this.constructor.calcAvgRatings(this.tour);
  // next();
});
reviewSchema.pre(/^findOne/, async function(next) {
  // NOTE: this is a query middle ware
  // so you have to execute the query first
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOne/, async function() {
  // await this.findOne ==> wrong because the query has been already executed
  await this.rev.constructor.calcAvgRatings(this.rev.tour);
});
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  // .populate({
  //     path: 'tour',
  //     select: 'name'
  //   });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
