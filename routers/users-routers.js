const express = require('express'),
  router = express.Router(),
  controller = require('./../controllers/users-controller'),
  authController = require(`./../controllers/authController`);

// NOTE: folder to be stored in

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// NOTE: will be applied all next routes because middleware runs in sequences
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', controller.getMe, controller.getUser);
router.patch(
  '/updateMe',
  controller.uploadPhoto,
  controller.resizeUserPhoto,
  authController.updateMe
);
router.delete('/deleteMe', authController.deleteMe);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(controller.getAllUsers)
  .post(controller.addUser);
router
  .route('/:id')
  .get(controller.getUser)
  .patch(controller.editUser);
// .delete(controller.deleteUser);
// BUG: here you wanna delete some user ==>
// 1- you must restrict it to admins only
// 2- you must edit it to be in a good way

module.exports = router;
