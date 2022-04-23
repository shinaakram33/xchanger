const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of a sub-category is required'],
  },
  image: {
    type: String,
    required: [true, 'Image of a sub-category is requierd'],
  },
  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Categroy Id is required'],
  },
  size: [
    {
      name: String,
      values: [String],
    },
  ],
});

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
