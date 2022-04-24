const express = require("express");
const {
  createOrder,
  getAllOrders,
  createImmediateOrder,
  orderAccepted,
  getPendingOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  searchOrder,
  getUserOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protected, restrictTo } = require("../controllers/authController");
const router = express.Router();

router.route("/").get(protected, getAllOrders).post(protected, createImmediateOrder);
router.route("/search").get(searchOrder);
router.route("/cart/:cartId").post(protected, createOrder);
router.route("/:orderId").patch(protected, orderAccepted)
  .get(protected, restrictTo('admin'), getOrderById)
  .delete(protected, restrictTo('admin'), deleteOrder);
router.route("/update/:orderId").patch(protected, restrictTo('admin'), updateOrder);
router.route("/pending").get(protected, getPendingOrders);
router.route("/user/:userId").get(protected, getUserOrders);
router.route("/updateStatus/:orderId").patch(protected, restrictTo('admin'), updateOrderStatus);

module.exports = router;
