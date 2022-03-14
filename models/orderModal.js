const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A name of a user is requierd"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },
    cartId: {
      type: mongoose.Schema.ObjectId,
      ref: "Cart",
      //required: [true, 'Cart id is required'],
    },
    checkoutId: {
      type: String,
      required: [true, "Checkout Id is required"],
    },
    status: {
      type: String,
      required: [true, "Make status into SOLD"],
    },
    productId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: [true, "Product Id is required"],
      },
    ],
    accepted: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    orderNumber: {
      type : String,
      required: [true, "Order number is mandatory."],
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
