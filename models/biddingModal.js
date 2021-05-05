const mongoose = require('mongoose');
const validator = require('validator');

const biddingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user data is required!'],
    },

  product:{ 
     type: mongoose.Schema.ObjectId,
     ref:'Product',
     required: [true, 'Product data is required!'],
  } ,
    condition: {
      type: String,
      required: [true, 'condition of product is required'],
      enum: {
        values: ['Old', 'New', 'Good'],
        message: 'condition is either: Old, New or Good',
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
    adDescription: {
      type: String,
      required: [true, 'adDescription is required'],
    },
      price:{
        type: Number,
        required: [true, 'Price is required!']
      },
      immediate_purchase_price:{
        type: Number,
        required: [true, 'Immediate price is required!']
      },
      date_for_auction:{
        starting_date:{
          type: Date,
          default: Date.now,
          required:[true, 'Starting Date is Required!']
        },
        ending_date:{
          type: Date,
          required:[true, 'Ending Date is Required!']
        }
      },
    brand:{
      type:String
    },
    color:{
       type:String,
    },
    size:{
      type:String,
    },
    season: {
      type: String,
    },
   

    location: {
      type: String,
      required: [true, 'location is required'],
    },
  
    subject: {
      type: String,
      required: [true, 'Subject  is required'],
    },
    bidByUser: [{ type: mongoose.Schema.ObjectId, ref: 'placeBid', default: undefined }],
  },
  { timestamps: true }
);
const Bidding = mongoose.model('Bidding', biddingSchema);
module.exports = Bidding;
