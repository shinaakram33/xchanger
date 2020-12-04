const Cart = require('../models/cartModal');

exports.createCart = async (req, res, next) => {
  try {
    let data = '';
    const alreadyExist = await Cart.findOne({ user: req.user.id });
    if (!alreadyExist) {
      await Cart.create({
        user: req.user.id,
        products: req.body.products,
      });
    } else {
      await alreadyExist.products.forEach((i, index) => {
        if (i.toString() === req.body.products) {
          res.status(400).json({
            status: 'fail',
            message: 'This product is already exist in the Cart',
          });
          data = 'aaaa';
        }
      });
      if (data === '') {
        await Cart.updateOne(
          {
            user: req.user.id,
          },
          { $push: { products: req.body.products } }
        );
      }
    }
    res.status(201).json({
      status: 'success',
      message: 'Added into Cart successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllCartProducts = async (req, res) => {
  try {
    const getCartList = await Cart.findOne({ user: req.user.id })
      .populate('user')
      .populate('products');
    res.status(200).json({
      status: 'success',
      data: getCartList,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.removeProductFromCart = async (req, res) => {
  try {
    const getProduct = await Cart.findOne({ user: req.user.id });
    if (getProduct) {
      await Cart.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: req.body.products } } }
      );
      res.status(200).json({
        status: 'success',
        message: 'Product is removed from Cart successfully',
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Product is not in the Cart',
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
