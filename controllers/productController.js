const { json } = require("express");
const Product = require("../models/productModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const FeatureAd = require("../models/featureAdModel");
const PlaceBid = require("../models/placebidModal");
const Cart = require("../models/cartModal");
const cron = require("node-cron");
const moment = require("moment");
const schedule = require("node-schedule");
const fetch = require("node-fetch");
const User = require("../models/userModal");
const Order = require("../models/orderModal");
const RecentView = require("../models/recentViewModal");
const Wishlist = require("../models/wishlistModal");

exports.createProduct = async (req, res) => {
  try {
    const obj = {
      Small: {
        type: 'S',
        // price: 7,
        price: 6.7,
        maxWeight: 2
      },
      Medium: {
        type: 'M',
        // price: 9.7,
        price: 9.29,
        maxWeight: 10
      },
      Large: {
        type: 'L',
        // price: 20.5,
        price: 19.63,
        maxWeight: 30
      }
    };

    if (!req.body) {
      res.status(400).json({
        status: "fail",
        message: "Please provide body of a product",
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

    console.log('here', req.body, req.params);
    // const obj_ = {
    //   price: req.body.price,
    //   priceNegotiation: req.body.priceNegotiation,
    //   color: req.body.color,
    //   size: req.body.size,
    //   country: req.body.country,
    //   season: req.body.season,
    //   condition: req.body.condition,
    //   image: req.body.image,
    //   brand: req.body.brand,
    //   subject: req.body.subject,
    //   title: req.body.title,
    //   description: req.body.description,
    //   category: req.params.categoryId,
    //   categoryName: req.body.categoryName,
    //   subCategoryId: req.params.subCategoryId,
    //   subCategoryOptionId: req.params.subCategoryOptionId,
    //   user: req.user.id,
    //   time: req.body.time,
    //   pakageSize: obj[req.body.pakageSize],
    // }
    // console.log('after object');
    // console.log(obj_);
    console.log(req.user.id);
    
    const pkgSize = obj[req.body.pakageSize];
    console.log(pkgSize);
    const newProduct = await Product.create({
      price: req.body.price,
      priceNegotiation: req.body.priceNegotiation,
      color: req.body.color,
      size: req.body.size,
      country: req.body.country,
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
      time: req.body.time,
      pakageSize: pkgSize,
    });
    console.log(newProduct);
    res.status(201).json({
      status: "success",
      message: "Product has been Created Successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getCategoryFilteredProduct = async (req, res) => {
  try {
    console.log(req.params);
    console.log(req.query);
    let searchCriteria = {
      status: "Not sold",
    };
    let sortingQuery = {};
    if (req.query.search) {
      searchCriteria = {
        $or: [
          {
            title: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
            },
          },
        ],
      };
    }
    if (req.params.categoryId) {
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
        "condition.state": req.query.condition.toLowerCase(),
      };
    }
    if (req.query.season) {
      // let season = (req.query.season.charAt(0).toUpperCase() + req.query.season.slice(1).toLowerCase());
      // console.log(season);
      searchCriteria.season = new RegExp(
        ".*" + req.query.season.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.size) {
      searchCriteria.size = new RegExp(
        ".*" + req.query.size.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.category) {
      searchCriteria.categoryName = new RegExp(
        ".*" + req.query.category.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.brand) {
      searchCriteria.brand = new RegExp(
        ".*" + req.query.brand.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.color) {
      var array = req.query.color.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      console.log(array);
      searchCriteria.color = {$in: array};
    }

    if (req.query.subject) {
      var array = req.query.subject.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      searchCriteria.subject = array;
    }

    if (req.query.state) {
      searchCriteria.state = new RegExp(
        ".*" + req.query.state.toLowerCase() + ".*",
        "i"
      );
    }

    if(req.query.flag) {
      searchCriteria.flag = req.query.flag;
    }

    if (req.query.buyingFormat) {
      searchCriteria.adType = new RegExp(
        ".*" + req.query.buyingFormat.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.sortingOrder) {
      if (req.query.sortingOrder.toLowerCase() === "asc") {
        sortingQuery = {
          "price.sellingPrice": 1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "desc") {
        sortingQuery = {
          "price.sellingPrice": -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "latest") {
        sortingQuery = {
          createdAt: -1,
        };
      } 
      // else if (req.query.sortingOrder.toLowerCase() === "sale") {
      // }
    }

    if (req.query.sortBy && req.query.sortingOrder) {
      var sortBy = req.query.sortBy;
      var sortingOrder = req.query.sortingOrder;
      sortingQuery[sortBy] = sortingOrder;
    }
    console.log(searchCriteria, sortingQuery);
    if (Object.keys(req.query).length !== 0) {
      const products = await Product.find(searchCriteria)
        .populate("category")
        .populate("subCategoryId")
        .populate("subCategoryOptionId")
        .populate("user")
        .sort(sortingQuery);
      return res.status(200).json({
        status: "success",
        length: products.length,
        data: products,
      });
    } else {
      console.log(searchCriteria);
      const products = await Product.find({
        category: req.params.categoryId,
        subCategoryId: req.params.subCategoryId,
        subCategoryOptionId: req.params.subCategoryOptionId,
        status: "Not sold",
      })
        .populate("category")
        .populate("subCategoryId")
        .populate("subCategoryOptionId")
        .populate("user");
      return res.status(200).json({
        status: "success",
        length: products.length,
        data: products,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
exports.getCategoryProduct = async (req, res) => {
  try {
    let searchCriteria = {
      status: "Not sold",
    };
    let sortingQuery = {};
    let products = null;
    if (req.query.search) {
      searchCriteria = {
        $or: [
          {
            title: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
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
        "condition.state": req.query.condition.toLowerCase(),
      };
    }
    if (req.query.season) {
      searchCriteria.season = new RegExp(
        ".*" + req.query.season.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.size) {
      searchCriteria.size = new RegExp(
        ".*" + req.query.size.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.category) {
      searchCriteria.categoryName = new RegExp(
        ".*" + req.query.category.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.brand) {
      searchCriteria.brand = new RegExp(
        ".*" + req.query.brand.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.color) {
      var array = req.query.color.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      searchCriteria.color = array;
    }

    if (req.query.subject) {
      var array = req.query.subject.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      searchCriteria.subject = array;
    }

    if (req.query.state) {
      searchCriteria.state = new RegExp(
        ".*" + req.query.state.toLowerCase() + ".*",
        "i"
      );
    }
    
    if(req.query.flag) {
      searchCriteria.flag = req.query.flag;
    }

    if (req.query.buyingFormat) {
      searchCriteria.adType = new RegExp(
        ".*" + req.query.buyingFormat.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.sortingOrder) {
      if (req.query.sortingOrder.toLowerCase() === "asc") {
        sortingQuery = {
          "price.sellingPrice": 1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "desc") {
        sortingQuery = {
          "price.sellingPrice": -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "latest") {
        sortingQuery = {
          createdAt: -1,
        };
      } 
      // else if (req.query.sortingOrder.toLowerCase() === "sale") {
      // }
    }

    if (req.query.sortBy && req.query.sortingOrder) {
      var sortBy = req.query.sortBy;
      var sortingOrder = req.query.sortingOrder;
      sortingQuery[sortBy] = sortingOrder;
    }
    if (Object.keys(req.query).length !== 0) {
      console.log(searchCriteria, sortingQuery)
      products = await Product.find(searchCriteria)
        .populate("category")
        .populate("subCategoryId")
        .populate("subCategoryOptionId")
        .populate("user")
        .sort(sortingQuery);
    } else {
      products = await Product.find({
        category: req.params.categoryId,
        status: "Not sold",
        adType: {$in: ['normal', 'featured']}
      })
      .sort({adType: 1, createdAt: -1})
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    }

    res.status(200).json({
      status: "success",
      length: products.length,
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createBiddingProduct = async (req, res) => {
  try {
    const obj = {
      Small: {
        type: 'S',
        price: 6.7,
        maxWeight: 2
      },
      Medium: {
        type: 'M',
        price: 9.29,
        maxWeight: 10
      },
      Large: {
        type: 'L',
        price: 19.63,
        maxWeight: 30
      }
    };
    const pkgSize = obj[req.body.pakageSize];
    console.log(pkgSize);

    const newProduct = await Product.create({
      price: req.body.price,
      color: req.body.color,
      size: req.body.size,
      country: req.body.country,
      season: req.body.season,
      condition: req.body.condition,
      image: req.body.image,
      brand: req.body.brand,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
      date_for_auction: {
        starting_date: req.body.date_for_auction.starting_date,
        ending_date: req.body.date_for_auction.ending_date
      },
      category: req.params.categoryId,
      categoryName: req.body.categoryName,
      subCategoryId: req.params.subCategoryId,
      subCategoryOptionId: req.params.subCategoryOptionId,
      user: req.user.id,
      adType: "bidding",
      status: "Not sold",
      pakageSize: pkgSize,
    });

    console.log(newProduct.date_for_auction);
  
    let min = moment(newProduct.date_for_auction.ending_date).minutes();
    let hour = moment(newProduct.date_for_auction.ending_date).hours();
    let day = moment(newProduct.date_for_auction.ending_date).format('D');
    let month = moment(newProduct.date_for_auction.ending_date).format('M');
    let year = moment(newProduct.date_for_auction.ending_date).format('Y');

    console.log(min, hour, day, month, year)
    let newJob = schedule.scheduleJob(`${min} ${hour} ${day} ${month} *`, async () => {
      console.log('Cron job executed.');
      let allBidsOfProduct = await PlaceBid.find({product: newProduct.id})
      .sort({price: -1, createdAt: -1});
      console.log(allBidsOfProduct.length, allBidsOfProduct);

      if(allBidsOfProduct.length <=0) {
        newProduct.status = 'Dismissed';
        await newProduct.save();
        console.log(newProduct);
      } else {
        let highestBid = allBidsOfProduct.shift();
        console.log('highest', highestBid);
        highestBid.succeeded = true;
        highestBid.status = 'Succeeded'
        await highestBid.save();
        console.log('highest after save', highestBid);


        const paymentIntentCapture = await stripe.paymentIntents.capture(
          highestBid.intentId
        );
        if (paymentIntentCapture.status === "succeeded") {
  
          console.log("status ", paymentIntentCapture.status);
                        
          const order = await Order.create({
            name: highestBid.orderDetails.name,
            email: (highestBid.orderDetails.email).trim().toLowerCase(),
            phoneNumber: highestBid.orderDetails.phoneNumber,
            location: highestBid.orderDetails.location,
            user: req.user.id,
            checkoutId: highestBid.intentId,
            status: "Complete",
            accepted: true,
            price: highestBid.price,
            productId: newProduct.id,
            shippingFee: highestBid.orderDetails.shippingFee,
          }).then(o => o.populate("productId").execPopulate());
          console.log("Order", order);
          newProduct.status = 'Sold';
          await newProduct.save();

          let cart = await Cart.findOne({ user: req.user.id });
          if(cart){
            await Cart.updateOne(
              {
                user: req.user.id,
              },
              { $pull: { products: { $in: order.productId } } }
            );
          }

          let recentView = await RecentView.findOne({ user: req.user.id });
          if(recentView){
            console.log('updating');
            await RecentView.updateOne(
              {
                user: req.user.id,
              },
              { $pull: { products: { $in: order.productId } } }
            );
          }

          let wishList = await Wishlist.findOne({ user: req.user.id });
          if(wishList){
            await Wishlist.updateOne(
              {
                user: req.user.id,
              },
              { $pull: { products: { $in: order.productId } } }
            );
          }
          console.log('after save', newProduct.status);

          let userData = {
            user: highestBid.user,
            product: newProduct.id,
            text: `Your bid on product ${newProduct.title} has been successful.`,
          };

          fetch("https://x-changer.herokuapp.com/api/v1/notification", {
            method: "POST",
            body: JSON.stringify(userData),
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              try {
                const dataa = await res.json();
                console.log("response data?", dataa);
              } catch (err) {
                console.log("error");
                console.log(err);
              }
            })
            .catch((error) => {
              console.log(error);
            });
          console.log(paymentIntentCapture);

          //make payment to seller
          const productSeller = await User.findById(newProduct.user);
          console.log(productSeller);

          // try{
          //       let transfer = await stripe.transfers.create({
          //       amount: Math.round(highestBid.price * 100),
          //       currency: 'CHF',
          //       destination: productSeller.connAccount.id,
          //       source_transaction: paymentIntentCapture.charges.data[0].id,
          //     });
          //     console.log(transfer);
          //   } catch (err) {
          //     console.log(err);
          // let admin = User.findOne({roles: 'admin'});
          //   let data = {
          //     user: admin.id,
          //     product: newProduct.id,
          //     text: `Transfer unsuccessful: Seller: ${newProduct.user}, Amount: ${newProduct.price}, Order: ${order.id}`,
          //   };
      
          //   fetch("https://x-changer.herokuapp.com/api/v1/notification", {
          //     method: "POST",
          //     body: JSON.stringify(data),
          //     headers: { "Content-Type": "application/json" },
          //   })
          //     .then(async (res) => {
          //       try {
          //         const dataa = await res.json();
          //         console.log("response data?", dataa);
          //       } catch (err) {
          //         console.log("error");
          //         console.log(err);
          //       }
          //     })
          //     .catch((error) => {
          //       console.log(error);
          //     });
          // }

          let sellerData = {
            user: newProduct.user,
            product: newProduct.id,
            text: `Your product ${newProduct.title} has been sold to: ${order.name}.`,
          };

          fetch("https://x-changer.herokuapp.com/api/v1/notification", {
            method: "POST",
            body: JSON.stringify(sellerData),
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              try {
                const dataa = await res.json();
                console.log("response data?", dataa);
              } catch (err) {
                console.log("error");
                console.log(err);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          return res.status(400).json({
            status: "fail",
            message: "Stripe error",
          });
        }
      }
      allBidsOfProduct.forEach(async (bid) => {
        await stripe.paymentIntents.cancel(bid.intentId);
        bid.status = 'Failed';
        await bid.save();
      });
      
      //send notification to other users
      let failedBidUsers = await PlaceBid.distinct('user', {"product": newProduct.id});
      console.log('failedBidUsers', failedBidUsers);
      failedBidUsers.forEach((user) => {
        let data = {
          user: user,
          product: newProduct.id,
          text: `Your bid on product ${newProduct.title} failed. The product has been sold`,
        };

        fetch("https://x-changer.herokuapp.com/api/v1/notification", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        })
          .then(async (res) => {
            try {
              const dataa = await res.json();
              console.log("response data?", dataa);
            } catch (err) {
              console.log("error");
              console.log(err);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
    });

    return res.status(201).json({
      status: "success",
      message: "Product has been Created Successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBiddingPendingProduct = async (req, res) => {
  try {
    const pendingProduct = await Product.find({ status: "Pending", flag: "Approved" })
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    res.status(200).json({
      status: "success",
      length: pendingProduct.length,
      data: pendingProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getBiddingProducts = async (req, res) => {
  try {
    let pendingProduct = null;
    let searchCriteria = {
      adType: "bidding",
      status: "Not sold",
    };
    let sortingQuery = {};
    if (req.query.search) {
      searchCriteria = {
        $or: [
          {
            title: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
            },
          },
          {
            brand: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
            },
          },
          {
            subject: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
            },
          },
          {
            season: {
              regex: new RegExp(
                ".*" + req.query.search.toLowerCase() + ".*",
                "i"
              ),
            },
          },
        ],
      };
    }
    if (req.query.condition) {
      searchCriteria = {
        "condition.state": req.query.condition.toLowerCase(),
      };
    }
    if (req.query.season) {
      searchCriteria.season = new RegExp(
        ".*" + req.query.season.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.size) {
      searchCriteria.size = new RegExp(
        ".*" + req.query.size.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.category) {
      searchCriteria.categoryName = new RegExp(
        ".*" + req.query.category.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.brand) {
      searchCriteria.brand = new RegExp(
        ".*" + req.query.brand.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.color) {
      var array = req.query.color.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      searchCriteria.color = array;
    }

    if (req.query.subject) {
      var array = req.query.subject.replace(/[\[\]]+/g,'').split(/[\s,]+/);
      searchCriteria.subject = array;
    }

    if (req.query.state) {
      searchCriteria.state = new RegExp(
        ".*" + req.query.state.toLowerCase() + ".*",
        "i"
      );
    }
    
    if(req.query.flag) {
      searchCriteria.flag = req.query.flag;
    }

    if (req.query.buyingFormat) {
      searchCriteria.adType = new RegExp(
        ".*" + req.query.buyingFormat.toLowerCase() + ".*",
        "i"
      );
    }

    if (req.query.sortingOrder) {
      if (req.query.sortingOrder.toLowerCase() === "asc") {
        sortingQuery = {
          "price.sellingPrice": 1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "desc") {
        sortingQuery = {
          "price.sellingPrice": -1,
        };
      } else if (req.query.sortingOrder.toLowerCase() === "latest") {
        sortingQuery = {
          createdAt: -1,
        };
      }
      // else if (req.query.sortingOrder.toLowerCase() === "sale") {
      // }
    }

    if (req.query.sortBy && req.query.sortingOrder) {
      var sortBy = req.query.sortBy;
      var sortingOrder = req.query.sortingOrder;
      sortingQuery[sortBy] = sortingOrder;
    }
    if (Object.keys(req.query).length !== 0) {
      pendingProduct = await Product.find(searchCriteria)
      .sort({createdAt: -1})
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    } else {
      pendingProduct = await Product.find({
        adType: "bidding",
        status: "Not sold",
      })
      .sort({createdAt: -1})
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    }
    res.status(200).json({
      status: "success",
      length: pendingProduct.length,
      data: pendingProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.changeBiddingStatus = async (req, res) => {
  try {
    const products = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        status: "Not sold",
        time: req.body.time,
      },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      message: "Status has been updated successfully",
      data: products,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createFeaturedProduct = async (req, res) => {
  try {
    const id = req.params.productId;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({
        status: "fail",
        message: "Product does not exist",
      });
    }
    else {
      if(!req.body.id) {
        return res.status(400).json({
          status: "fail",
          message: "Please provide pakage id",
        });
      }
      // let response;
      let response = await fetch("https://x-changer.herokuapp.com/api/v1/featureAd/pakages", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        try {
          return await res.json();
        } catch (err) {
          console.log("error");
          console.log(err);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      let pakages =  response.data;
      console.log('pakages',  pakages);
      const adPakage = pakages.find((pakage) => {
        if(pakage.id === req.body.id)
          return pakage
        
      })
      console.log(adPakage);
      const featureAd = await FeatureAd.create({
        user: req.user.id,
        AddTitle: adPakage.title,
        description: adPakage.description,
        price: adPakage.price,
        noOfDays: adPakage.days
      });
      featureAd.expirationDate = (moment(featureAd.createdAt).add(featureAd.noOfDays, 'd')).toDate();
      console.log(featureAd.expirationDate);
      await featureAd.save();
      product.featureAd = featureAd.id;
      product.adType = 'featured';
      await product.save().then(product => product.populate("featureAd").execPopulate());

      let min = moment(featureAd.expirationDate, 'HH:MM').minutes();
      let hour = moment(featureAd.expirationDate, 'HH:MM').hours();
      let day = moment(featureAd.expirationDate).format('D');
      let month = moment(featureAd.expirationDate).format('M');
      let year = moment(featureAd.expirationDate).format('Y');

      console.log(min, (hour), day, month, year)

      let modifyAd = schedule.scheduleJob(`${min} ${hour} ${day} ${month} *`, async () => {
          console.log('Cron job executed.')
          const ad = await FeatureAd.findByIdAndDelete(featureAd.id);
          product.adType = 'normal';
          product.featureAd = undefined;
          await product.save();
          });
    return res.status(200).json({
        status: 'success',
        message: 'Product is featured',
        data: product
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getFeaturedPosts = async (req, res) => {
  try{
    const featuredPosts = await Product.aggregate([
      {
        $lookup: {
          from: "FeatureAd",
          localField: "featureAd",
          foreignField: "_id",
          as: "featureAd",
        }
      },
      {
        $unwind: "$featureAd"
      },
      {
        $sort: {
          createdAt: -1
        }
      }                               
    ]);
    // await Product.populate(featuredPosts, {path: "user", path: "category"});

    if(!featuredPosts || featuredPosts.length < 1)
    {
      return res.status(400).json({
        status: "fail",
        message: 'No featured posts to show',
      });
    }
    console.log(featuredPosts.length);

    return res.status(200).json({
      status: "success",
      data: featuredPosts,
    });

  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUserProducts = async (req, res) => {
  try { 
    let userPosts;   
    if(req.query.flag) {
      let flag = req.query.flag;
      userPosts = await Product.find({ user: { $in: req.params.userId }, flag })
      .sort({"createdAt": -1})
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
      
    }
    else 
      userPosts = await Product.find({ user: { $in: req.params.userId } })
      .sort({"createdAt": -1})
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    if (!userPosts) {
      res.status(400).json({
        status: "fail",
        message: "No product found",
      });
    }
    res.status(200).json({
      status: "success",
      length: userPosts.length,
      data: userPosts,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  let searchCriteria = {
    status: "Not sold",
    adType: { $in: [ "normal", "featured" ]  } 
  };
  let sortingQuery = {};
  if (req.query.title) {

    searchCriteria.title = new RegExp(
      ".*" + req.query.title.toLowerCase() + ".*",
      "i"
    );
    // searchCriteria = {
    //   $or: [
    //     {
    //       title: {
    //         regex: new RegExp(
    //           ".*" + req.query.search.toLowerCase() + ".*",
    //           "i"
    //         ),
    //       },
    //     },
    //     {
    //       brand: {
    //         regex: new RegExp(
    //           ".*" + req.query.search.toLowerCase() + ".*",
    //           "i"
    //         ),
    //       },
    //     },
    //     {
    //       subject: {
    //         regex: new RegExp(
    //           ".*" + req.query.search.toLowerCase() + ".*",
    //           "i"
    //         ),
    //       },
    //     },
    //     {
    //       season: {
    //         regex: new RegExp(
    //           ".*" + req.query.search.toLowerCase() + ".*",
    //           "i"
    //         ),
    //       },
    //     },
    //   ],
    // };
  }
  if (req.query.condition) {
    searchCriteria = {
      "condition.state": req.query.condition.toLowerCase(),
    };
  }
  if (req.query.season) {
    searchCriteria.season = new RegExp(
      ".*" + req.query.season.toLowerCase() + ".*",
      "i"
    );
  }

  if (req.query.size) {
    searchCriteria.size = new RegExp(
      ".*" + req.query.size.toLowerCase() + ".*",
      "i"
    );
  }

  if (req.query.category) {
    searchCriteria.categoryName = new RegExp(
      ".*" + req.query.category.toLowerCase() + ".*",
      "i"
    );
  }

  if (req.query.brand) {
    searchCriteria.brand = new RegExp(
      ".*" + req.query.brand.toLowerCase() + ".*",
      "i"
    );
  }

  if (req.query.color) {
    var array = req.query.color.replace(/[\[\]]+/g,'').split(/[\s,]+/);
    searchCriteria.color = array;
  }

  if (req.query.subject) {
    var array = req.query.subject.replace(/[\[\]]+/g,'').split(/[\s,]+/);
    searchCriteria.subject = array;
  }

  if (req.query.state) {
    searchCriteria.state = new RegExp(
      ".*" + req.query.state.toLowerCase() + ".*",
      "i"
    );
  }

  if(req.query.flag) {
    searchCriteria.flag = req.query.flag;
  }

  if (req.query.buyingFormat) {
    searchCriteria.adType = new RegExp(
      ".*" + req.query.buyingFormat.toLowerCase() + ".*",
      "i"
    );
  }

  if (req.query.sortingOrder) {
    if (req.query.sortingOrder.toLowerCase() === "asc") {
      sortingQuery = {
        "price.sellingPrice": 1,
      };
    } else if (req.query.sortingOrder.toLowerCase() === "desc") {
      sortingQuery = {
        "price.sellingPrice": -1,
      };
    } else if (req.query.sortingOrder.toLowerCase() === "latest") {
      sortingQuery = {
        createdAt: -1,
      };
    } 
    // else if (req.query.sortingOrder.toLowerCase() === "sale") {
    // }
  }

  if (req.query.sortBy && req.query.sortingOrder) {
    var sortBy = req.query.sortBy;
    var sortingOrder = req.query.sortingOrder;
    sortingQuery[sortBy] = sortingOrder;
  } else {
    sortingQuery = { adType:1, "createdAt": -1 }
  }
  searchCriteria.adType = { $in: [ "normal", "featured" ]  }
  console.log(searchCriteria);

  if (Object.keys(req.query).length !== 0) {
    const allProduct = await Product.find(searchCriteria)
    .populate("category")
    .populate("subCategoryId")
    .populate("subCategoryOptionId")
    .populate("user")
    .sort(sortingQuery);
    return res.status(200).json({
      status: "success",
      length: allProduct.length,
      data: allProduct,
    });
  } else {
    const allProduct = await Product.find({
      status: "Not sold",
      adType: { $in: [ "normal", "featured" ]  } 
    })
    .sort({adType: 1, createdAt: -1})
    .populate("category")
    .populate("subCategoryId")
    .populate("subCategoryOptionId")
    .populate("user");
    if (!allProduct) {
      return res.status(400).json({
        status: "fail",
        message: "No Product found of this category",
      });
    }
    return res.status(200).json({
      status: "success",
      length: allProduct.length,
      data: allProduct,
    });
  }
};

exports.getSpecificProductDetail = async (req, res) => {
  try {
    const specificProduct = await Product.findById(req.params.productId)
    .populate("category")
    .populate("subCategoryId")
    .populate("subCategoryOptionId")
    .populate("user");
    
    if (!specificProduct) {
      return res.status(400).json({
        status: "fail",
        message: "No Product Found",
      });
    }
    return res.status(200).json({
      status: "success",
      data: specificProduct,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
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
        status: "fail",
        message: "product does not exist",
      });
    }
    // if (product.user.toString() !== req.user.id) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'You do not have an access to update this product',
    //   });
    // }

    if (updates.rating) {
      if (!product.rating) {
        let dummyrating = 0;
      } else {
        let dummyrating = product.rating;
      }

      let prevRating = dummyrating;

      let newRating = (prevRating + updates.rating) / 2;

      updates.rating = newRating;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      options
    );
    res.status(200).json({
      status: "success",
      message: "Product is updated successfully",
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
      status: "fail",
      message: error,
    });
  }
};
//delete
exports.deleteProducts = async (req, res) => {
  try {
    const id = req.params.productId;
    if (!id) {
      res.status(400).json({
        status: "fail",
        message: "Product Id is required",
      });
    }
    const product = await Product.findById(id);
    if (!product) {
      res.status(400).json({
        status: "fail",
        message: "product does not exist",
      });
    }
    const result = await Product.findByIdAndDelete(id);
    return res.status(200).json({
      status: "successful",
      message: "product delete successfully",
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.scheduleAndAddToCart = async (req, res) => {
  try {
    console.log("Hello");
    let { productId } = req.params;
    let product = await Product.findById(productId);
    let updatedProduct = await Product.findOneAndUpdate(req.params.productId, {
      status: "Not Sold",
    });
    console.log(updatedProduct);

    let bidProducts = await PlaceBid.find({ product: productId });
    console.log(bidProducts);
    let userId = req.user.id;
    let dateFromDb = new Date(product.time.endingTime);

    let h = dateFromDb.getHours() - 5;
    let m = dateFromDb.getMinutes();
    let d = dateFromDb.getDate();

    console.log(h, m, d);

    let date = { date: d, hour: h, minute: m };
    console.log(date);
    var job = schedule.scheduleJob(date, () => {
      console.log("time");
      let max = 0;
      let IdOfMaxBidUser;
      if (bidProducts) {
        for (let x of bidProducts) {
          if (x.price > max) {
            max = x.price;
            IdOfMaxBidUser = x.user;
          }
        }
        if (max < product.price.originalPrice) {
          res.status(400).json({
            status: "Fail",
            message: "Max Bided price is less then mininmum price",
          });
        }
        console.log("Times Up");
        async function addToCart() {
          let alreadyExist = await Cart.findOne({ user: IdOfMaxBidUser });
          if (alreadyExist) {
            await Cart.updateOne(
              {
                user: userId,
              },
              { $push: { products: product.id } }
            );
          } else {
            await Cart.create({
              user: IdOfMaxBidUser,
              products: [product.id],
            });
          }
        }
        addToCart();
        let dataOfBidUser = {
          user: IdOfMaxBidUser,
          product: product.id,
          text: `Product ${product.title} has been added to your cart`,
        };

        fetch("https://x-changer.herokuapp.com/api/v1/notification", {
          method: "POST",
          body: JSON.stringify(dataOfBidUser),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((json) => console.log(json));

        let dataOfProductOwner = {
          user: product.user,
          text: `Your product ${product.title} has been sold`,
        };

        fetch("https://x-changer.herokuapp.com/api/v1/notification", {
          method: "POST",
          body: JSON.stringify(dataOfProductOwner),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((json) => console.log(json));
      } else {
        res.status(400).json({
          status: "Fail",
          message: "No bids found on this product",
        });
      }
    });

    //console.log('Job', job)

    res.status(200).json({
      status: "successful",
      message: "Added to cart",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateWishlistStatus = async (req, res) => {
  try {
    let { productId, status } = req.body;
    const product = await Product.findById(productId);
    console.log(product);
    if (!product) {
      res.status(400).json({
        status: "fail",
        message: "product does not exist",
      });
    }

    let updatedProduct = await Product.findOneAndUpdate(productId, {
      wishlistStatus: status,
    });
    console.log(updatedProduct);

    res.send(200).json({
      status: "successful",
      message: "Wishlist Updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateRating = async (req, res) => {
  try {
    let { productId, rating } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(400).json({
        status: "fail",
        message: "product does not exist",
      });
    }

    let prevRating = parseInt(product.rating);

    let newRating = (prevRating + rating) / 2;

    let updatedProduct = await Product.findOneAndUpdate(productId, {
      rating: newRating,
    });
    console.log(updatedProduct);

    res.send(200).json({
      status: "successful",
      message: "Rating Updated Successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getRandomProducts = async (req, res) => {
  try {
    let product = await Product.find({ flag: "Approved" })
    .populate("category")
    .populate("subCategoryId")
    .populate("subCategoryOptionId")
    .populate("user")
    .limit(10)
    .sort({"createdAt": -1});

    if (!product || product.length<1) {
      return res.status(400).json({
        status: "fail",
        message: "No random products to show",
      });
    }

    let products = { products: product };
    return res.json({
      status: "successful",
      message: "Random Products Found",
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getProductByTitle = async (req, res) => {
  try {
    let product;
    if (req.query.flag) {
      let flag = req.query.flag;
      product = await Product.find({ title: req.params.title, flag })
      .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    }
    product = await Product.find({ title: req.params.title })
    .populate("category")
      .populate("subCategoryId")
      .populate("subCategoryOptionId")
      .populate("user");
    if (!product) {
      res.status(400).json({
        status: "fail",
        message: "product does not exist",
      });
    }

    console.log(product);

    return res.json({
      status: "successful",
      message: "Random Products Found",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
