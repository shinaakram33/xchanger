const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
  },
  image: {
    type: String,
    required: [true, 'Brand image is required'],
  },
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
