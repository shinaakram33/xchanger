const express = require('express');
const {
  signup,
  login,
  forgetPassword,
  pinCodeCompare,
  resetPassword,
  updateUser,
  protected,
} = require('../controllers/authController');
const router = express.Router();

router.route('/:userId').patch(protected, updateUser);
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgetPassword').post(forgetPassword);
router.route('/pinCompare').post(pinCodeCompare);
router.route('/resetPassword/:pin').post(resetPassword);

module.exports = router;
