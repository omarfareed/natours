const stripe = require('stripe')(
  'sk_test_51JYRhODix4r2vkMxRLwktx8I57wE5SRL4DkoCLvkD9PVvPanatRL8X97TD3zTxGnpeFNamxvyVqgsdeGkbNlqN4000TLNHn94m'
);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('./../models/bookingsModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();
  const booking = await Booking.create({ tour, user, price });
  // next();
  res.redirect(req.originalUrl.split('?')[0]);
});
