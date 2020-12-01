const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of a category is required'],
  },
  image: {
    type: String,
    required: [true, 'Image of a category is requierd'],
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
