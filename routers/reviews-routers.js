const express = require('express'),
  // NOTE: mergeParams for merging tourId from nested routes
  router = express.Router({ mergeParams: true }),
  reviewController = require('./../controllers/reviewController'),
  authController = require('./../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    // authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.addNewReview
  );
router
  .route('/:id')
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
