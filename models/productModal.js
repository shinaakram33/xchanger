const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    price: {
      orignalPrice: {
        type: Number,
      },
      sellingPrice: {
        type: Number,
        default: undefined,
      },
      immediate_purchase_price: {
        type: Number,
        default: undefined,
      },
    },
    priceNegotiation: {
      type: Boolean,
      default: undefined,
    },
    color: [{
      type: String,
      required: [true, 'Color of product is required'],
    }],
    size: {
      type: String,
      required: [true, 'Size of a product is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category Options Name is required'],
    },
    country: {
      type: String,
      required: [true, 'State of a product is required'],
      enum: {
        values: ['USA', 'UK', 'EU', 'US', 'FR', 'International', 'UK-US'],
        message: 'State is required',
      },
    },
    season: {
      type: String,
      enum: {
        values: ['Spring', 'Summer', 'Autumn', 'Winter', 'All'],
        message: 'Season must be Spring, Summer, Autumn, Winter or All',
      },
    },
    condition: {
      state: {
        type: String,
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
      frontPhoto: {
        type: String,
        required: [true, 'Front Photo is required'],
      },
      clawPhoto: {
        type: String,
        required: [true, 'Caw Photo is required'],
      },
      backPhoto: {
        type: String,
        required: [true, 'Back Photo is required'],
      },
      wearPhoto: {
        type: String,
      },
      sizePhoto: {
        type: String,
        required: [true, 'Size Photo is required'],
      },
      authenicationCardPhoto: {
        type: String,
      },
      otherPhoto: {
        type: String,
      },
    },
    status: {
      type: String,
      default: 'Not sold',
      enum: {
        values: ['Sold', 'Not sold', 'Pending', 'Dismissed'],
        message: 'Status is can only be: Sold, Not sold or Pending',
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
    date_for_auction: {
      starting_date: {
        type: String,
        default: undefined,
      },
      ending_date: {
        type: String,
        default: undefined,
      },
    },
    time: {
      startingTime: {
        type: Date,
        default: undefined,
      },
      endingTime: {
        type: Date,
        default: undefined,
      },
    },
    checkoutId: {
      type: String,
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
    wishlistStatus: {
      type: Boolean,
      defalt: false
    },
    rating: {
      type: Number,
      defalt: 0
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User data is required'],
    },
    featureAd: {
      type: mongoose.Schema.ObjectId,
      ref: 'FeatureAd',
      default: undefined,
    },
    flag: {
      type: String,
      enum: ['Pending', 'Approved'],
      default: 'Pending',
    },
    pakageSize: {
      type: Object,
      require: [true, 'Pakage size is required']
    }
  },
  { timestamps: true }
);
const product = mongoose.model('Product', productSchema);
module.exports = product;
