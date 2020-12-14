const mongoose = require('mongoose');
const validator = require('validator');

const biddingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'user data is required'],
  },

  productprice: {
    type: String,
    required: [true, 'productprice is required'],
  },
  condition: {
    type: String,
    required: [true, 'condition of product is required'],
    enum: {
      values: ['Old', 'New', 'Good'],
      message: 'condition is either: Old, New or Good',
    },
  },
  status: {
    type: String,
    default: 'PROSCESSING',
    required: [true, ' Status of product is required'],
    enum: {
      values: ['PROCESSING', 'SCRUTINIZING', 'ACCEPT', 'REJECT', 'SOLD', 'NOT SOLD'],
      message: 'Status is either:PROCESSING, SCRUTINIZING, ACCEPT,REJECT,SOLD,Or  NOT SOLD',
    },
  },
  productAuthentiaction: {
    type: String,
    required: [true, 'productAuthentiaction  is required'],
    enum: {
      values: ['Yes', 'No'],
      message: 'productAuthentiaction is either: Yes, No',
    },
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
      message: 'image of a product is required',
    },
  },
  adTitle: {
    type: String,
    required: [true, 'adTitle is required'],
  },
  addescription: {
    type: String,
    required: [true, 'addescription is required'],
  },
  price: {
    min: {
      type: String,
      required: [true, 'minPrice is required'],
    },
    max: {
      type: String,
      required: [true, 'maxPrice is required'],
    },
  },
  date: {
    to: {
      type: Date,
      default: Date.now,
      required: [true, 'start date is required'],
    },
    from: {
      type: Date,
      required: [true, 'ending date is required'],
    },
  },

  location: {
    type: String,
    required: [true, 'location is required'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  contact: {
    type: String,
    required: [true, 'contact is required'],
  },
  name: {
    type: String,
    required: [true, 'name is required'],
  },
});
const Bidding = mongoose.model('Bidding', biddingSchema);
module.exports = Bidding;
