const { options } = require('../app');
const Category = require('../models/categoryModal');
const product = require('../models/productModal');

exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const newCategory = await Category.create({
      name,
      image,
    });
    res.status(201).json({
      status: 'success',
      category: newCategory,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const allCategaories = await Category.find();
    res.status(200).json({
      status: 'success',
      length: allCategaories.length,
      data: allCategaories,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
//update
exports.updatecategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;
    const options = { new: true };
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      res.status(400).json({
        status: 'fail',
        message: 'category does not exist',
      });
    }
    const updatedcategory = await Category.findByIdAndUpdate(categoryId, updates, options);
    res.status(200).json({
      status: 'success',
      message: 'category is updated successfully',
      data: updatedcategory,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

//delete
exports.deletecategory = async (req, res) => {
  try {
    const id = req.params.categoryId;
    const category = await Category.findById(req.params.categoryId);
    if (!Category) {
      res.status(400).json({
        status: 'fail',
        message: 'category does not exist',
      });
    }

    const result = await Category.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      message: 'category is delete successfully',
    });
  } catch (error) {
  }
};
