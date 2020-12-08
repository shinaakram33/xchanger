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
    console.log('allBrands', allBrands);
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

exports.updateBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const updates = req.body;
    const options = { new: true };
    const brand = await Brand.findById(req.params.brandId);
    console.log(brand);
    if (!brand) {
      res.status(400).json({
        status: 'fail',
        message: 'brand does not exist',
      });
    }
    const updatedbrand = await Brand.findByIdAndUpdate(brandId, updates, options);
    res.status(200).json({
      status: 'success',
      message: 'brand is updated successfully',
      data: updatedbrand,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deletebrand = async (req, res) => {
  try {
    const id = req.params.brandId;
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) {
      res.status(400).json({
        status: 'fail',
        message: 'brand does not exist',
      });
    }
    const result = await Brand.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      message: 'brand is delete successfully',
    });
  } catch (error) {
    console.log(message.error);
  }
};
