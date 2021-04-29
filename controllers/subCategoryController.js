const SubCategory = require('../models/subCategoryModal');
const Category = require('../models/categoryModal');

exports.createSubCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const newSubCategory = await SubCategory.create({
      name,
      image,
      categoryId: req.params.categoryId,
    });
    res.status(201).json({
      status: 'success',
      message: 'Sub Categroy has been created successfully',
      category: newSubCategory,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Categroy Exist',
      });
    }
    const subCategory = await SubCategory.find({ categoryId: req.params.categoryId }).populate('categoryId');
    res.status(200).json({
      status: 'success',
      length: subCategory.length,
      data: subCategory,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true };
    const subCategory = await SubCategory.findById(req.params.subCategoryId);
    if (!subCategory) {
      res.status(400).json({
        status: 'fail',
        message: 'category does not exist',
      });
    }
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(req.params.subCategoryId, updates, options);
    res.status(200).json({
      status: 'success',
      message: 'Sub Category is updated successfully',
      data: updatedSubCategory,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.subCategoryId);
    if (!subCategory) {
      res.status(400).json({
        status: 'fail',
        message: 'Sub Category does not exist',
      });
    }

    const result = await SubCategory.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      message: 'Sub Category is delete successfully',
    });
  } catch (error) {
    console.log(message.error);
  }
};
