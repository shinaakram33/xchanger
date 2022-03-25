const WishList = require('../models/wishlistModal');

exports.createWishList = async (req, res) => {
  try {
    let check;
    const alreadyExist = await WishList.findOne({ user: req.user.id });
    if (!alreadyExist) {
      await WishList.create({
        user: req.user.id,
        products: req.body.products,
      });
    } else {
      check = alreadyExist.products.find((i) => {
        if(i.toString() === req.body.products)
          return true;
        else return false;
      });
      if (check) {
        return res.status(400).json({
              status: 'fail',
              message: 'This product is already exist in the Wishlish',
        });
      } else {
        await WishList.updateOne(
          {
            user: req.user.id,
          },
          { $push: { products: req.body.products } }
        );
      }
    }
    res.status(201).json({
      status: 'success',
      message: 'Added into wishlist successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllWishList = async (req, res) => {
  try {
    const getWishList = await WishList.findOne({ user: req.user.id })
      .populate('user')
      .populate('products');
    res.status(200).json({
      status: 'success',
      data: getWishList,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.removeProductFromWishList = async (req, res) => {
  try {
    const getProduct = await WishList.findOne({ user: req.user.id });
    if (getProduct) {
      await WishList.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: req.body.products } } }
      );
      res.status(200).json({
        status: 'success',
        message: 'Product is removed from wishlist successfully',
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Product is not in the wishlist',
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
