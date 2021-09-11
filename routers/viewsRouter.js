const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
// router.use(authController.protect);
router.get('/Me', authController.protect, viewsController.showMe);
router.use(authController.isLoggedIn);
router.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview
);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.login);

module.exports = router;
