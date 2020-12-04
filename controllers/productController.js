const Product = require('../models/productModal');
exports.createProduct = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide body of a product',
      });
    }
    const newProduct = await Product.create({
      name: req.body.name,
      price: req.body.price,
      image: req.body.image,
      condition: req.body.condition,
      color: req.body.color,
      description: req.body.description,
      category: req.params.categoryId,
      user: req.user.id,
    });
    res.status(201).json({
      status: 'success',
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const pendingPost = await Product.findById(req.params.productId);
    console.log('aaaaaaaaaaaaaaaaaaa', pendingPost);
    if (!pendingPost) {
      res.status(400).json({
        status: 'fail',
        message: 'No product found',
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'Product is updated successfully',
      data: updatedProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllPendingPosts = async (req, res) => {
  try {
    console.log('categoryId', req.params.categoryId);
    console.log('body', req.params.statusId);
    const pendingPosts = await Product.find({
      category: { $in: req.params.categoryId },
      status: { $in: req.params.statusId },
    });
    // console.log('aaaa', pendingPosts);
    if (!pendingPosts) {
      res.status(400).json({
        status: 'fail',
        message: 'No product found',
      });
    }
    res.status(200).json({
      status: 'success',
      length: pendingPosts.length,
      data: pendingPosts,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const userPosts = await Product.find({ user: { $in: req.params.userId } });
    if (!userPosts) {
      res.status(400).json({
        status: 'fail',
        message: 'No product found',
      });
    }
    res.status(200).json({
      status: 'success',
      length: userPosts.length,
      data: userPosts,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const allProduct = await Product.find({ category: { $in: req.params.categoryId } });
    if (!allProduct) {
      res.status(400).json({
        status: 'fail',
        message: 'No Product found of this category',
      });
    }
    res.status(200).json({
      status: 'success',
      length: allProduct.length,
      data: allProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
//update
exports.updateProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;
    const options = { new: true };

    const product = await Product.findById(productId.toString());
    if (!product) {
      res.status(400).json({
        status: 'fail',
        message: 'product does not exist',
      });
    }
    if (product.user.toString() !== req.user.id) {
      res.status(400).json({
        status: 'fail',
        message: 'You do not have an access to update this product',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, options);
    res.status(200).json({
      status: 'success',
      message: 'Product is updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
//delete
exports.deleteProducts = async (req, res) => {
  try {
    const id = req.params.productId;
    const product = await Product.findById(productId.toString());
    if (!product) {
      res.status(400).json({
        status: 'fail',
        message: 'product does not exist',
      });
    }
    if (product.user.toString() !== req.user.id) {
      res.status(400).json({
        status: 'fail',
        message: 'You do not have an access to update this product',
      });
    }
    const result = await product.findByIdAndDelete(id);
    res.send(result);
  } catch (error) {
    console.log(message.error);
  }
};
