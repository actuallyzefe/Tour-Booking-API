const express = require('express');
const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');

const router = express.Router();

// Users

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// IMPORTANT LESSON ALERT
// bu noktadan sonraki butun oruseların protected olmasını istiyoruz
// hepsine tek tke protect eklemek yerıne middlewareların özelliğini kullanalım
// middlewarelar sırayla çalıştığından router.use kodudundan ıtıbaren tum satırlar protected oldu
router.use(authController.protect);

router.get(
  '/me',

  userController.getMe,
  userController.getSpesificUser
);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.patch(
  '/updateMyPassword',

  authController.updatePassword
);

// IMPORTANT LESSON ALERT
// bu noktadan sonraki butun oruseların protected olmasını istiyoruz
// hepsine tek tke protect eklemek yerıne middlewareların özelliğini kullanalım
// middlewarelar sırayla çalıştığından router.use kodudundan ıtıbaren tum satırlar protected oldu

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getSpesificUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
