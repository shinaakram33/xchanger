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
exports.getAllProduct = async (req, res) => {
  try {
    const allProduct = await Product.find();
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
