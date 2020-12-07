const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User Id is required'],
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product Id is required'],
      validate: {
        validator: function (val) {
          if (this.products.length === 0) {
            return false;
          }
        },
        message: 'Product Id is required',
      },
    },
  ],
  selectedProducts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      default: undefined,
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
