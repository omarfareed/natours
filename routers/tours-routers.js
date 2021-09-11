const express = require('express'),
  router = express.Router(),
  controller = require('./../controllers/tours-controller'),
  authController = require('./../controllers/authController'),
  // reviewController = require('./../controllers/reviewController');
  reviewRouter = require('./../routers/reviews-routers');
router
  .route('/top-5-cheapest')
  .get(controller.aliasTopTours, controller.getAllTours);
router.route('/stats').get(controller.getToursStats);
router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide')
  // controller.getMonthlyPlan TODO: create this function
);

router
  .route('/')
  .get(authController.protect, controller.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.postNewTour
  );

router.route('/distances/:latLng/unit/:unit').get(controller.getDistances);
router
  .route('/tours-within/:distance/center/:latLng/unit/:unit')
  .get(controller.getToursWithin);
router
  .route('/:id')
  .get(controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    controller.uploadTourImages,
    controller.resizeTourImages,
    controller.editTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    controller.deleteTour
  );
// router.route('/:tourId/reviews').post(
//   authController.protect,
//   // authController.restrictTo('user'),
//   reviewController.addNewReview
// );
router.use('/:tourId/reviews', reviewRouter);
// router.param('id', controller.checkID);
// console.log(router);
module.exports = router;
