const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    require: [true, 'booking must have a tour']
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    require: [true, 'booking must have a user']
  },
  price: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    default: true
  }
});
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
