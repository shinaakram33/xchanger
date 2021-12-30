const express = require("express");
const {
  createNotification,
  getAllUserNotifications,
  updateAllNotificationStatus,
} = require("../controllers/notificationController");
const { protected } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(createNotification);
router.route("/notificationStatus").post(updateAllNotificationStatus);
router.route("/:userId").get(getAllUserNotifications);

module.exports = router;
