const Notification = require("../models/notificationModal");

exports.createNotification = async (req, res) => {
  const { user, text, product, status, chat_room_id } = req.body;

  try {
    let notification = new Notification({
      user,
      product,
      text,
      status,
      chat_room_id,
    });

    await notification.save();

    return res.status(200).json({
      status: "success",
      message: "Notification is created successfully",
      data: notification,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllUserNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ user: userId })
      .populate("user")
      .populate("product");
    if (!notifications) {
      return res.status(400).json({
        status: "fail",
        message: "No Notifications Found For This User",
      });
    }
    let countOfFalseNotification = await Notification.countDocuments({
      status: false,
      user: userId,
    });
    console.log("notifications ", notifications);
    res.status(200).json({
      status: "success",
      count: countOfFalseNotification,
      data: notifications,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateNotificationStatus = async (req, res) => {
  const { notificationId } = req.params;

  try {
    let notification = await Notification.findById(notificationId);
    if (!notifications) {
      return res.status(400).json({
        status: "fail",
        message: "No Notifications Found",
      });
    }

    let updatedNotification = await Notification.findOneAndUpdate(
      notificationId,
      { status: true }
    );

    console.log(updatedNotification);

    res.status(200).json({
      status: "Notification status Updated",
      data: notifications,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateAllNotificationStatus = async (req, res) => {
  try {
    let notifications = req.body.notificationIds;
    console.log(notifications);

    let updatedNotification = await Notification.updateMany(
      {
        _id: {
          $in: notifications,
        },
      },
      {
        $set: {
          status: true,
        },
      }
    );

    console.log(updatedNotification);

    res.status(200).json({
      status: "Notification status Updated",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
