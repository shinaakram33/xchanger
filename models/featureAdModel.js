const mongoose = require('mongoose');

const featureAddSchema = new mongoose.Schema({
  user:{
      type: mongoose.Schema.ObjectId,
      ref:'User'
  },
//   AddTitle:{
//       type:String,
//     //   required: [true, 'Add Title is Required!'],
//   },
//   description:{
//       type:String,
//     //   required: [true, 'Add Description is Required!'],
//   },
  price:{
      type:Number,
      required: [true, 'Price is Required!']
  },
  noOfDays:{
      type:Number,
      required:[true, 'Number of Days is Required!']
  },
  expirationDate:{
      type: Date
  }
}, { timestamps: true });

const featureAd = mongoose.model('FeatureAd', featureAddSchema);

module.exports = featureAd;
