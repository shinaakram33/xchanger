const mongoose = require('mongoose');

const SubCategoryOptionModalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of a sub-category option is required'],
  },
  image: {
    type: String,
    required: [true, 'Image of a sub-category option is requierd'],
  },
  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Categroy Id is required'],
  },
  subCategoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubCategory',
    required: [true, 'Sub Category Id is required'],
  },
});

const SubCategoryOption = mongoose.model('SubCategoryOptions', SubCategoryOptionModalSchema);

module.exports = SubCategoryOption;
