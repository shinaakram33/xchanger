const Cart = require('../models/cartModal');

exports.createCart = async (req, res, next) => {
  try {
    let check;
    const alreadyExist = await Cart.findOne({ user: req.user.id });
    if (!alreadyExist) {
      console.log('creating new cart');
      await Cart.create({
        user: req.user.id,
        products: req.body.products,
      });
    } else {
      console.log('matching items of  cart');
      check = alreadyExist.products.find((i) => {
        if(i.toString() === req.body.products)
          return true;
        else return false;
      });
      if (check) {
        return res.status(400).json({
              status: 'fail',
              message: 'This product is already exist in the Cart',
        });
      } else{
        await Cart.updateOne(
          {
            user: req.user.id,
          },
          { $push: { products: req.body.products } }
        );
      }
    }
    return res.status(201).json({
      status: 'success',
      message: 'Added into Cart successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
  

exports.getAllCartProducts = async (req, res) => {
  try {
    const getCartList = await Cart.findOne({ user: req.user.id })
    .populate('user').populate('products').select('-selectedProducts');
    if (!getCartList) {
      return res.status(400).json({
        status: 'fail',
        message: 'There is no cart exist',
      });
    }
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

exports.selectedProductFromCart = async (req, res, next) => {
  try {
    console.log(req.body);
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart._id.toString() !== req.params.cartId) {
      res.status(400).json({
        status: 'fail',
        message: 'You dont have an access to perform this action',
      });
    }
    cart.selectedProducts = undefined;
    await cart.save({ validateBeforeSave: false });
    cart.selectedProducts = req.body.selectedProducts;
    await cart.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'Products selected successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getSelectedProductFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cartId).populate('selectedProducts').select('-products');
    // if (cart.user !== req.user.id) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'You dont have an access to perform this action',
    //   });
    // }
    if (!cart) {
      return res.status(400).json({
        status: 'fail',
        message: 'You dont have an access to perform this action',
      });
    }

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
