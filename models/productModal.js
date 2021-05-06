const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    price: {
      orignalPrice: {
        type: Number,
        required: [true, 'Original Price of product is required'],
      },
      sellingPrice: {
        type: Number,
        required: [true, 'Selling Price of a product is required'],
      },
    },
    priceNegotiation: {
      type: Boolean,
      required: [true, 'Price Negotiation is required'],
    },
    color: {
      type: String,
      required: [true, 'Color of product is required'],
    },
    size: {
      type: String,
      required: [true, 'Size of a product is required'],
      enum: {
        values: ['XXL', 'XL', 'M'],
        message: 'Size of product must be XXL, XL or M',
      },
    },
    categoryName: {
      type: String,
      required: [true, 'Category Options Name is required'],
    },
    state: {
      type: String,
      required: [true, 'State of a product is required'],
      enum: {
        values: ['USA', 'UK'],
        message: 'State is required',
      },
    },
    season: {
      type: String,
      required: [true, 'Season of a product is required'],
      enum: {
        values: ['spring', 'summer', 'autumn', 'winter'],
        message: 'Season must be spring, summer, autumn, or winter',
      },
    },
    condition: {
      state: {
        type: String,
        required: [true, 'Condition of a product is required'],
        enum: {
          values: ['new', 'very_good', 'good'],
          message: 'Condition is either: new, very_good or good',
        },
      },
      wornPriceTag: {
        type: Boolean,
        default: undefined,
      },
      tagImage: {
        type: String,
        default: undefined,
      },
    },
    brand: {
      type: String,
      required: [true, 'Brand of a product is required'],
    },
    subject: {
      type: String,
      required: 'Subject of a product is required',
    },
    title: {
      type: String,
      required: [true, 'Title of a product is required'],
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
      default: 'not_sold',
      enum: {
        values: ['sold', 'not_sold'],
        message: 'Condition is either: sold, not_sold',
      },
    },
    adType: {
      type: String,
      required: [true, 'type of ad is required'],
      default: 'normal',
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
    subCategoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Sub Category Id is required'],
    },
    subCategoryOptionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubCategoryOptions',
      required: [true, 'Sub Category Option is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category Options Name is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User data is required'],
    },
    featureAd:{
      type: mongoose.Schema.ObjectId,
      ref:'FeatureAd',
      default: undefined,
    }
  },
  { timestamps: true }
);

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
