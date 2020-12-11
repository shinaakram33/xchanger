const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of a product is required'],
  },
  price: {
    type: String,
    required: [true, 'price of product is required'],
  },
  condition: {
    type: String,
    required: [true, 'condition of product is required'],
    enum: {
      values: ['Old', 'New', 'Good'],
      message: 'Condition is either: Old, New or Good',
    },
  },
  color: {
    type: String,
    required: [true, 'color of product is required'],
  },
  description: {
    type: String,
    required: [true, 'description of product is required'],
  },
  image: {
    type: [String],
    required: [true, 'image of product is required'],
    validate: {
      validator: function (val) {
        if (this.image.length === 0) {
          return false;
        }
      },
      message: 'Image of a product is required',
    },
  },
  // make: {
  //   type: String,
  // },
  status: {
    type: String,
    default: 'PROCESSING',
    enum: {
      values: ['PROCESSING', 'SCRUTINIZING', 'ACCEPT', 'SOLD', 'NOT_SOLD'],
      message: 'Condition is either: PROCESSING, SCRUTINIZING, ACCEPT, SOLD, NOT_SOLD',
    },
  },
  adType: {
    type: String,
    required: [true, 'type of ad is required'],
    enum: {
      values: ['normal', 'featured', 'bidding'],
      message: 'ad type is either: normal, featured or bidding',
    },
  },
  adPrice: {
    type: String,
  },
  checkoutId: {
    type: String,
  },
  userName: {
    type: String,
    required: [true, 'Name of a user is required'],
  },
  userPhone: {
    type: String,
    required: [true, 'Phone Number of a user is required'],
  },
  userEmail: {
    type: String,
    required: [true, 'Email of a user is required'],
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'category of product is required'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User data is required'],
  },
});

// productSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'category',
//   });
//   next();
// });
// productSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: '-__v -password -passwordResetToken, -passwordResetTokenExpire -roles',
//   });
//   next();
// });
const product = mongoose.model('Product', productSchema);
module.exports = product;
