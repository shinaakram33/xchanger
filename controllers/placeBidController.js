const placebid = require('../models/placebidModal');
const Product = require('../models/productModal');

exports.createplaceBid = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'provide body of product',
      });
    }
    const biddingProduct = await Product.findById(req.params.productId);
    console.log(biddingProduct);
    if (!biddingProduct) {
      return res.status(400).json({
        status: 'Fail',
        message: 'Product not found',
      });
    } else if (biddingProduct.price.orignalPrice <= req.body.price) {
      return res.status(400).json({
        status: 'fails',
        message: 'Entering biding price is greater than product existing price!',
      });
    } else {
      const placeBid = await placebid.create({
        product: req.params.productId,
        user: req.user.id,
        price: req.body.price,
      });
      return res.status(201).json({
        status: 'success',
        message: 'Bidding is created successfully',
        data: placeBid,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllplacebid = async (req, res) => {
  try {
    const getAllplacebid = await placebid.find().populate('user').populate('product');
    res.status(200).json({
      status: 'success',
      length: getAllplacebid.length,
      data: getAllplacebid,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTotalplacebid = async (req, res) => {
  try {
    const getTotalplacebid = await placebid
      .findOne({
        user: req.user.id,
        product: req.params.productId,
      })
      .populate('user')
      .populate('products');
    res.status(200).json({
      status: 'success',
      data: getTotalplacebid,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
