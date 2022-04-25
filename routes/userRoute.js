const express = require("express");
const {
  signup,
  login,
  forgetPassword,
  pinCodeCompare,
  resetPassword,
  updateUser,
  protected,
  restrictTo,
  changePassword,
  updatePrivacteStatus,
  getAllUsers,
  getUserById,
  deleteUser,
  searchUsers,
  rateSeller,
  rateMultipleSellers,
} = require("../controllers/authController");
const router = express.Router();


router.route("/").get(getAllUsers)
router.route("/search").get(searchUsers)
router.route("/:userId")
.patch(protected, updateUser).get(getUserById)
.delete(protected, restrictTo('admin'), deleteUser);
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgetPassword").post(forgetPassword);
router.route("/pinCompare").post(pinCodeCompare);
router.route("/resetPassword/:pin").post(resetPassword);
router.route("/changePassword/:userId").post(protected, changePassword);
router.route("/private").put(updatePrivacteStatus);
router.route("/rating/:userId").patch(protected, rateSeller);

module.exports = router;
