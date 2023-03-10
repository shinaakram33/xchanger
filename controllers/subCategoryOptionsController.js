const SubCategoryOptions = require('../models/subCategoryOptionsModal');

exports.createSubCategoryOptions = async (req, res) => {
  try {
    const { name, image } = req.body;
    const newSubCategoryOption = await SubCategoryOptions.create({
      name,
      image,
      categoryId: req.params.categoryId,
      subCategoryId: req.params.subCategoryId,
    });
    res.status(201).json({
      status: 'success',
      message: 'Sub Categroy Options has been created successfully',
      category: newSubCategoryOption,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllSubCategoryOptions = async (req, res) => {
  try {
    const data = await SubCategoryOptions.find().populate('categoryId')
    .sort({name: 1}).populate('subCategoryId');
    res.status(200).json({
      status: 'success',
      length: data.length,
      data: data,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getSubCategoryOptions = async (req, res) => {
  try {
    const subCategoryOption = await SubCategoryOptions.find({ categoryId: req.params.categoryId, subCategoryId: req.params.subCategoryId })
    .populate('categoryId')
    .populate('subCategoryId');

    let other;
    if(subCategoryOption.findIndex((object => {return object.name === 'Other'})) >= 0)
      other = subCategoryOption.splice(subCategoryOption.findIndex((object => {return object.name === 'Other'})), 1);
    
    subCategoryOption.sort(function(a, b) {
      if(a.name < b.name) return -1;
      if(b.name < a.name) return 1;  
    })
    
    if(other)
      subCategoryOption.push(other[0]);
    res.status(200).json({
      status: 'success',
      length: subCategoryOption.length,
      data: subCategoryOption,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateSubCategoryOptions = async (req, res) => {
  try {
    const subCategoryOption = await SubCategoryOptions.findById(req.params.subCategoryOptionId);
    if (!subCategoryOption) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Sub Category Option Found',
      });
    }
    const updateSubCategoryOption = await SubCategoryOptions.findByIdAndUpdate(req.params.subCategoryOptionId, req.body, { new: true });
    res.status(200).json({
      status: 'fail',
      message: 'Sub Category Option is updated successfully',
      data: updateSubCategoryOption,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteSubCategoryOptions = async (req, res) => {
  try {
    const subCategoryOption = await SubCategoryOptions.findById(req.params.subCategoryOptionId);
    if (!subCategoryOption) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Sub Category Option Found',
      });
    }
    await SubCategoryOptions.findByIdAndDelete(req.params.subCategoryOptionId);
    res.status(200).json({
      status: 'success',
      message: 'Sub Category Option is deleted successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
