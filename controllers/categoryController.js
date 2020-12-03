const Category = require('../models/categoryModal');

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