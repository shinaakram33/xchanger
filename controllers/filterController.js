const Category = require('../models/categoryModal');
const Brands = require('../models/brandModal');
const Product = require('../models/productModal');

exports.applyFilter = (req, res) => {
  try {
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
