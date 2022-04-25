const SubCategory = require('../models/subCategoryModal');
const Category = require('../models/categoryModal');
const SubCategoryOption = require("../models/subCategoryOptionsModal");

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
    await subCategory.sort((a, b) => {
      if(a.name === 'Other')
        return 1;
      else if(a.name < b.name)
        return -1
      else return 1;
    });
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
      return res.status(400).json({
        status: 'fail',
        message: 'Sub Category does not exist',
      });
    }
    const result = await SubCategory.findByIdAndDelete(req.params.subCategoryId);
    return res.status(200).json({
      status: 'success',
      message: 'Sub Category is delete successfully',
    });
  } catch (error) {
    return res.status(200).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getSize = async (req, res) => {
  try{
    if(!req.body.subCategoryId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Subcategory is required',
      });
    }
    let subCategory = await SubCategory.findById(req.params.subCategoryId);
    if(!subCategory) {
      return res.status(403).json({
        status: 'fail',
        message: 'Subcategory does not exist',
      });
    }
    if(req.body.subCategoryOptionName) {
      let data = [];
      subCategory.size.forEach((s) => {
        if(s.name === req.body.subCategoryOptionName)
          data.push(s);
      });
      if(!data || data.length<0) {
        return res.status(403).json({
          status: 'fail',
          message: 'Size for subcategoryOption does not exist',
        });
      } 
      return res.status(200).json({
        status: 'success',
        data: data,
      });
    }
  return res.status(200).json({
    status: 'success',
    data: subCategory.size,
  });    
  } catch (err) {
    return res.status(200).json({
      status: 'fail',
      message: err.message,
    });
  }
}