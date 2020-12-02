const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name of a product is required'],
      },
      price:{
          type:String,
          required:[true,'price of product is required'],
      },
condition:{
    type:String,
    required: [true, 'condition of product is required'],
    enum: {
      values: ['old', 'new', 'good'],
      message: 'Condition is either: old, new, good',
    },
  },
color:{
    type:String,
    required:[true,'color of product is required'],
},
design:{
    type:String,
    required:[true,'design of product is required'],
},
image:{
    type: [String],
    required:[true,'image of product is required'],
},
category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required:[true,'category of product is required'],
},
});
const product  = mongoose.model('Product', productSchema);
module.exports =product;
