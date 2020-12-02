const Brand = require('../models/brandModal');

exports.createBrand = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide name and image of a brand',
      });
    }
    const newBrand = await Brand.create({
      name: req.body.name,
      image: req.body.image,
    });
    res.status(201).json({
      status: 'success',
      data: newBrand,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const allBrands = await Brand.find();
    res.status(200).json({
      status: 'success',
      data: allBrands,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
