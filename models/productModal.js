const mongoose = require('mongoose');
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

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    //   select: '-__v -passwordResetToken -passwordResetExpires',
  });
  next();
});
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -password -passwordResetToken, -passwordResetTokenExpire -roles',
  });
  next();
});
const product = mongoose.model('Product', productSchema);
module.exports = product;
