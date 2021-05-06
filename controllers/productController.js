const { json } = require('express');
const Product = require('../models/productModal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const featureAd = require('../models/featureAdModel');
const cron = require('node-cron')

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
      subCategoryId: req.params.subCategoryId,
      subCategoryOptionId: req.params.subCategoryOptionId,
      user: req.user.id,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPhone: req.body.userPhone,
      adType: req.body.adType,
    
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

exports.getCategoryFilteredProduct = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId, subCategoryId: req.params.subCategoryId, subCategoryOptionId: req.params.subCategoryOptionId });
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

exports.getCategoryProduct = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId });
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

exports.updateStatus = async (req, res) => {
  try {
    const pendingPost = await Product.findById(req.params.productId);
    if (!pendingPost) {
      return res.status(400).json({
        status: 'fail',
        message: 'No product found',
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        condition: req.body.condition,
        color: req.body.color,
        description: req.body.description,
        adType: req.body.adType,
        category: req.params.categoryId,
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPhone: req.body.userPhone,
        status: req.body.status,
      },
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
    let pendingPosts = null;
    if (req.query.search) {
      pendingPosts = await Product.find({
        category: { $in: req.params.categoryId },
        status: { $in: req.params.statusId },
        $or: [
          {
            name: {
              $regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
            },
          },
          {
            price: {
              $regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
            },
          },
          {
            color: {
              $regex: new RegExp('.*' + req.query.search.toLowerCase() + '.*', 'i'),
            },
          },
        ],
      });
    } else {
      pendingPosts = await Product.find({
        category: { $in: req.params.categoryId },
        status: { $in: req.params.statusId },
      });
    }

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
  let searchCriteria = {};
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

  if (req.query) {
    // const sortInt = req.query.price === 'decreasing price' ? 1 : -1;
    // delete req.query.price;
    // const filterProduct = await Product.find({
    //   $or: [req.query],
    // }).sort({
    //   'price.sellingPrice': sortInt,
    // });
    console.log(searchCriteria);
    const allProduct = await Product.find(searchCriteria).populate('category').populate('subCategoryId').populate('subCategoryOptionId').sort(sortingQuery);
    res.status(200).json({
      status: 'successs',
      length: allProduct.length,
      data: allProduct,
    });
  } else {
    const allProduct = await Product.find();
    if (!allProduct) {
      res.status(400).json({
        status: 'fail',
        message: 'No Product found of this category',
      });
    }
    res.status(200).json({
      status: 'successs',
      length: allProduct.length,
      data: allProduct,
    });
  }

  //   if(req.query.filter === 'increasing price')
  //   {
  //     const increasingPrice = await Product.aggregate([{$sort: {
  //       "price.sellingPrice": -1
  //     }}])
  //     res.status(200).json({
  //       status: 'successs',
  //       length: increasingPrice.length,
  //       data: increasingPrice,
  //     });

  //   }

  // else if (req.query.filter === 'decreasing price')
  // {
  //   const decreasingPrice = await Product.aggregate([{$sort: {
  //     "price.sellingPrice": 1
  //   }}])
  //   res.status(200).json({
  //     status: 'successs',
  //     length: decreasingPrice.length,
  //     data: decreasingPrice,
  //   });

  // }

  // else if (req.query.filter === 'bigDiscount')
  // {
  //   const bigDiscount = await Product.aggregate(
  //     [{$project: {
  //       status:"$status",
  //       adType:"$adType",
  //       orignalPrice:"$price.orignalPrice",
  //       sellingPrice:"$price.sellingPrice",
  //       priceNegotiation:"$priceNegotiation",
  //       color:"$color",
  //       size:"$size",
  //       state:"$state",
  //       season:"$season",
  //       image:"$image",
  //       condition:"$condition",
  //       price:"$price",
  //       bigDiscount:{
  //              $subtract : ["$price.orignalPrice", "$price.sellingPrice"]}
  //    }}, {$sort: {
  //      bigDiscount: -1
  //    }}]
  //   )
  //   res.status(200).json({
  //     status: 'successs',
  //     length: bigDiscount.length,
  //     data: bigDiscount,
  //   });

  // }

  // else if (req.query.size)
  // {
  //   const extraLargeSize = await Product.aggregate(
  //     [
  //       {
  //         '$match': {
  //           'size': `${req.query.size}`
  //         }
  //       }
  //     ]
  //   )

  //   res.status(200).json({
  //     status: 'successs',
  //     length: extraLargeSize.length,
  //     data: extraLargeSize
  //   });

  // }

  // else if (req.query.brand)
  // {
  //   const brandItems = await Product.aggregate(
  //     [
  //       {
  //         '$match': {
  //           'brand': `${req.query.brand}`
  //         }
  //       }
  //     ]

  //   )
  //   res.status(200).json({
  //     status: 'successs',
  //     length: brandItems.length,
  //     data: brandItems,
  //   });

  // }

  // else if (req.query.condition)
  // {
  //   const itemsOnConditionBased = await Product.aggregate(
  //     [
  //       {
  //         '$match': {
  //           'condition.state':  `${req.query.condition}`
  //         }
  //       }
  //     ]
  //   )

  //   res.status(200).json({
  //     status: 'successs',
  //     length: itemsOnConditionBased.length,
  //     data: itemsOnConditionBased,
  //   });

  // }
  // else if (req.query.filter === 'latest')
  // {

  //       const latestItems = await Product.find();
  //       res.status(200).json({
  //         status: 'successs',
  //         length: latestItems.length,
  //         data: latestItems.reverse(),
  //       });

  // }

  // else{

  // try {
  //   const allProduct = await Product.find();
  //   if (!allProduct) {
  //     res.status(400).json({
  //       status: 'fail',
  //       message: 'No Product found of this category',
  //     });
  //   }
  //   res.status(200).json({
  //     status: 'successs',
  //     length: allProduct.length,
  //     data: allProduct,
  //   });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }

  //}
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
    if(updatedProduct.featureAd != null && updatedProduct.featureAd != 'undefined' && req.body.featureAd) {
      
      const specificFeatureAd = await featureAd.findById(updatedProduct.featureAd);
      const numberOfDays = specificFeatureAd.noOfDays;
      const timing = `00 00 00 ${numberOfDays} * *`;
      console.log(timing)
        var task = cron.schedule( timing , () => {
          console.log("do now something that i want!")
      });
      console.log("Cron-Job Task", task);
      console.log(numberOfDays)
    }
    else{
      console.log("my name is khan!")
    }
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
