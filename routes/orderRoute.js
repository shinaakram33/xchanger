const express = require("express");
const {
  createOrder,
  getAllOrders,
  createImmediateOrder,
  orderAccepted,
  getPendingOrders,
} = require("../controllers/orderController");
const { protected } = require("../controllers/authController");
const router = express.Router();

router.route("/cart/:cartId").post(protected, createOrder);
router.route("/:orderId").patch(protected, orderAccepted);
router.route("/pending").get(protected, getPendingOrders);
router
  .route("/")
  .get(protected, getAllOrders)
  .post(protected, createImmediateOrder);

module.exports = router;
