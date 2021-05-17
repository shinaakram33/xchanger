const { json } = require('express');
const Product = require('../models/productModal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const featureAd = require('../models/featureAdModel');
const cron = require('node-cron');

exports.createProduct = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide body of a product',
      });
    }
    // if (req.body.adType === 'featured') {
    //   if (!req.body.adPrice) {
    //     return res.status(400).json({
    //       status: 'fail',
    //       message: 'Please provide checkout price for posting an ad',
    //     });
    //   }
    //   const charge = await stripe.charges.create({
    //     amount: req.body.adPrice * 100,
    //     currency: 'usd',
    //     source: req.body.source,
    //   });
    //   if (charge.paid) {
    //     const newProduct = await Product.create({
    //       name: req.body.name,
    //       price: req.body.price,
    //       image: req.body.image,
    //       condition: req.body.condition,
    //       color: req.body.color,
    //       description: req.body.description,
    //       adType: req.body.adType,
    //       category: req.params.categoryId,
    //       user: req.user.id,
    //       checkoutId: charge.balance_transaction,
    //     });
    //     res.status(201).json({
    //       status: 'success',
    //       product: newProduct,
    //     });
    //   }
    // } else {
    const newProduct = await Product.create({
      price: req.body.price,
      priceNegotiation: req.body.priceNegotiation,
      color: req.body.color,
      size: req.body.size,
      state: req.body.state,
      season: req.body.season,
      condition: req.body.condition,
      image: req.body.image,
      brand: req.body.brand,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
      category: req.params.categoryId,
      categoryName: req.body.categoryName,
      subCategoryId: req.params.subCategoryId,
      subCategoryOptionId: req.params.subCategoryOptionId,
      user: req.user.id,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone,
    });
    res.status(201).json({
      status: 'success',
      message: 'Product has been Created Successfully',
      product: newProduct,
    });
    // }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getCategoryFilteredProduct = async (req, res) => {
  try {
    let searchCriteria = {
      status: 'not_sold',
    };
    let sortingQuery = {};
    if (req.query.search) {
      searchCriteria = {
        $or: [
          {
            title: {
              regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
            },
          },
        ],
      };
    }
    if (req.params.category) {
      searchCriteria = {
        categoryId: req.params.categoryId,
      };
    }
    if (req.params.subCategoryId) {
      searchCriteria = {
        subCategoryId: req.params.subCategoryId,
      };
    }
    if (req.params.subCategoryOptionId) {
      searchCriteria = {
        subCategoryOptionId: req.params.subCategoryOptionId,
      };
    }
    if (req.query.condition) {
      searchCriteria = {
        'condition.state': req.query.condition.toLowerCase(),
      };
    }
    if (req.query.season) {
      searchCriteria.season = new RegExp('.*' + req.query.season.toLowerCase() + '.*', 'i');
    }

    if (req.query.size) {
      searchCriteria.size = new RegExp('.*' + req.query.size.toLowerCase() + '.*', 'i');
    }

    if (req.query.category) {
      searchCriteria.categoryName = new RegExp('.*' + req.query.category.toLowerCase() + '.*', 'i');
    }

    if (req.query.brand) {
      searchCriteria.brand = new RegExp('.*' + req.query.brand.toLowerCase() + '.*', 'i');
    }

    if (req.query.color) {
      searchCriteria.color = new RegExp('.*' + req.query.color.toLowerCase() + '.*', 'i');
    }

    if (req.query.state) {
      searchCriteria.state = new RegExp('.*' + req.query.state.toLowerCase() + '.*', 'i');
    }

    if (req.query.buyingFormat) {
      searchCriteria.adType = new RegExp('.*' + req.query.buyingFormat.toLowerCase() + '.*', 'i');
    }

    if (req.query.sortingOrder) {
      if (req.query.sortingOrder.toLowerCase() === 'asc') {
        sortingQuery = {
          'price.sellingPrice': 1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'desc') {
        sortingQuery = {
          'price.sellingPrice': -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'latest') {
        sortingQuery = {
          createdAt: -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'sale') {
      }
    }

    if (req.query.sortBy && req.query.sortingOrder) {
      var sortBy = req.query.sortBy;
      var sortingOrder = req.query.sortingOrder;
      sortingQuery[sortBy] = sortingOrder;
    }
    if (Object.keys(req.query).length !== 0) {
      const products = await Product.find(searchCriteria).populate('category').populate('subCategoryId').populate('subCategoryOptionId').sort(sortingQuery);
      return res.status(200).json({
        status: 'success',
        length: products.length,
        data: products,
      });
    } else {
      const products = await Product.find({
        category: req.params.categoryId,
        subCategoryId: req.params.subCategoryId,
        subCategoryOptionId: req.params.subCategoryOptionId,
        status: 'not_sold',
      })
        .populate('category')
        .populate('subCategoryId')
        .populate('subCategoryOptionId');
      return res.status(200).json({
        status: 'success',
        length: products.length,
        data: products,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getCategoryProduct = async (req, res) => {
  try {
    let searchCriteria = {
      status: 'not_sold',
    };
    let sortingQuery = {};
    let products = null;
    if (req.query.search) {
      searchCriteria = {
        $or: [
          {
            title: {
              regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
            },
          },
        ],
      };
    }
    if (req.params.category) {
      searchCriteria = {
        categoryId: req.params.categoryId,
      };
    }
    if (req.query.condition) {
      searchCriteria = {
        'condition.state': req.query.condition.toLowerCase(),
      };
    }
    if (req.query.season) {
      searchCriteria.season = new RegExp('.*' + req.query.season.toLowerCase() + '.*', 'i');
    }

    if (req.query.size) {
      searchCriteria.size = new RegExp('.*' + req.query.size.toLowerCase() + '.*', 'i');
    }

    if (req.query.category) {
      searchCriteria.categoryName = new RegExp('.*' + req.query.category.toLowerCase() + '.*', 'i');
    }

    if (req.query.brand) {
      searchCriteria.brand = new RegExp('.*' + req.query.brand.toLowerCase() + '.*', 'i');
    }

    if (req.query.color) {
      searchCriteria.color = new RegExp('.*' + req.query.color.toLowerCase() + '.*', 'i');
    }

    if (req.query.state) {
      searchCriteria.state = new RegExp('.*' + req.query.state.toLowerCase() + '.*', 'i');
    }

    if (req.query.buyingFormat) {
      searchCriteria.adType = new RegExp('.*' + req.query.buyingFormat.toLowerCase() + '.*', 'i');
    }

    if (req.query.sortingOrder) {
      if (req.query.sortingOrder.toLowerCase() === 'asc') {
        sortingQuery = {
          'price.sellingPrice': 1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'desc') {
        sortingQuery = {
          'price.sellingPrice': -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'latest') {
        sortingQuery = {
          createdAt: -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === 'sale') {
      }
    }

    if (req.query.sortBy && req.query.sortingOrder) {
      var sortBy = req.query.sortBy;
      var sortingOrder = req.query.sortingOrder;
      sortingQuery[sortBy] = sortingOrder;
    }
    if (Object.keys(req.query).length !== 0) {
      products = await Product.find(searchCriteria).populate('category').populate('subCategoryId').populate('subCategoryOptionId').sort(sortingQuery);
    } else {
      products = await Product.find({ category: req.params.categoryId, status: 'not_sold' }).populate('category').populate('subCategoryId').populate('subCategoryOptionId');
    }

    res.status(200).json({
      status: 'success',
      length: products.length,
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createBiddingProduct = async (req, res) => {
  try {
    const newProduct = await Product.create({
      price: req.body.price,
      color: req.body.color,
      size: req.body.size,
      state: req.body.state,
      season: req.body.season,
      condition: req.body.condition,
      image: req.body.image,
      brand: req.body.brand,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
      date_for_auction: req.body.date_for_auction,
      category: req.params.categoryId,
      categoryName: req.body.categoryName,
      subCategoryId: req.params.subCategoryId,
      subCategoryOptionId: req.params.subCategoryOptionId,
      user: req.user.id,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone,
      adType: 'bidding',
      status: 'pending',
    });
    res.status(201).json({
      status: 'success',
      message: 'Product has been Created Successfully',
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getBiddingPendingProduct = async (req, res) => {
  try {
    const pendingProduct = await Product.find({ status: 'pending' }).populate('category').populate('subCategoryId').populate('subCategoryOptionId');
    res.status(200).json({
      status: 'success',
      length: pendingProduct.length,
      data: pendingProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getBiddingProducts = async (req, res) => {
  try {
    const pendingProduct = await Product.find({ adType: 'bidding' }).populate('category').populate('subCategoryId').populate('subCategoryOptionId');
    res.status(200).json({
      status: 'success',
      length: pendingProduct.length,
      data: pendingProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.changeBiddingStatus = async (req, res) => {
  try {
    const products = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        status: 'not_sold',
        time: req.body.time,
      },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'Status has been updated successfully',
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createFeaturedProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide body of a product',
      });
    }
    if (req.body.adType === 'featured') {
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getFeaturedPosts = async (req, res) => {};

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
  let searchCriteria = {
    status: 'not_sold',
  };
  let sortingQuery = {};
  if (req.query.search) {
    searchCriteria = {
      $or: [
        {
          title: {
            regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
          },
        },
        {
          brand: {
            regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
          },
        },
        {
          subject: {
            regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
          },
        },
        {
          season: {
            regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
          },
        },
      ],
    };
  }
  if (req.query.condition) {
    searchCriteria = {
      'condition.state': req.query.condition.toLowerCase(),
    };
  }
  if (req.query.season) {
    searchCriteria.season = new RegExp('.*' + req.query.season.toLowerCase() + '.*', 'i');
  }

  if (req.query.size) {
    searchCriteria.size = new RegExp('.*' + req.query.size.toLowerCase() + '.*', 'i');
  }

  if (req.query.category) {
    searchCriteria.categoryName = new RegExp('.*' + req.query.category.toLowerCase() + '.*', 'i');
  }

  if (req.query.brand) {
    searchCriteria.brand = new RegExp('.*' + req.query.brand.toLowerCase() + '.*', 'i');
  }

  if (req.query.color) {
    searchCriteria.color = new RegExp('.*' + req.query.color.toLowerCase() + '.*', 'i');
  }

  if (req.query.state) {
    searchCriteria.state = new RegExp('.*' + req.query.state.toLowerCase() + '.*', 'i');
  }

  if (req.query.buyingFormat) {
    searchCriteria.adType = new RegExp('.*' + req.query.buyingFormat.toLowerCase() + '.*', 'i');
  }

  if (req.query.sortingOrder) {
    if (req.query.sortingOrder.toLowerCase() === 'asc') {
      sortingQuery = {
        'price.sellingPrice': 1,
      };
    } else if (req.query.sortingOrder.toLowerCase() === 'desc') {
      sortingQuery = {
        'price.sellingPrice': -1,
      };
    } else if (req.query.sortingOrder.toLowerCase() === 'latest') {
      sortingQuery = {
        createdAt: -1,
      };
    } else if (req.query.sortingOrder.toLowerCase() === 'sale') {
    }
  }

  if (req.query.sortBy && req.query.sortingOrder) {
    var sortBy = req.query.sortBy;
    var sortingOrder = req.query.sortingOrder;
    sortingQuery[sortBy] = sortingOrder;
  }

  if (Object.keys(req.query).length !== 0) {
    const allProduct = await Product.find(searchCriteria).populate('category').populate('subCategoryId').populate('subCategoryOptionId').sort(sortingQuery);
    return res.status(200).json({
      status: 'success',
      length: allProduct.length,
      data: allProduct,
    });
  } else {
    const allProduct = await Product.find({ status: 'not_sold' }).populate('category').populate('subCategoryId').populate('subCategoryOptionId');
    if (!allProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Product found of this category',
      });
    }
    return res.status(200).json({
      status: 'success',
      length: allProduct.length,
      data: allProduct,
    });
  }
};

exports.getSpecificProductDetail = async (req, res) => {
  try {
    const specificProduct = await Product.findById(req.params.productId);
    if (!specificProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Product Found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: specificProduct,
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
      return res.status(400).json({
        status: 'fail',
        message: 'product does not exist',
      });
    }
    if (product.user.toString() !== req.user.id) {
      return res.status(400).json({
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
    //console.log(updatedProduct)
    // if (updatedProduct.featureAd != null && updatedProduct.featureAd != 'undefined' && req.body.featureAd) {
    //   const specificFeatureAd = await featureAd.findById(updatedProduct.featureAd);
    //   const numberOfDays = specificFeatureAd.noOfDays;
    //   const timing = `00 00 00 ${numberOfDays} * *`;
    //   console.log(timing);
    //   var task = cron.schedule(timing, () => {
    //     console.log('do now something that i want!');
    //   });
    //   console.log('Cron-Job Task', task);
    //   console.log(numberOfDays);
    // } else {
    //   console.log('my name is khan!');
    // }
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
        message: 'product does not delete',
      });
    }
    const result = await product.findByIdAndDelete(id);
    res.send(200).json({
      status: 'successful',
      message: 'product delete successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
