const placebid = require('../models/placebidModal');
const Product = require('../models/productModal');
const User = require("../models/userModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const schedule = require("node-schedule");
const moment = require('moment');
const fetch = require("node-fetch");
const mongoose = require('mongoose');
const Order = require("../models/orderModal");

exports.createplaceBid = async (req, res) => {
  try {
    console.log('in');
    if (!req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'provide body of product',
      });
    }
    console.log(req.body)
    const product = await Product.findById(req.body.product);
    if (!product) {
      return res.status(400).json({
        status: 'Fail',
        message: 'Product not found',
      });
    // } else if (product.price.immediate_purchase_price < req.body.price) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'Price must be greater than or equal to immediate purchase price',
    //   });
    } else {
      if (!req.body.source) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid credentials",
        });
      }
          
      // const token = await stripe.tokens.create({
      //     card: {
      //       number: "4242424242424242",
      //       exp_month: 1,
      //       exp_year: 2023,
      //       cvc: "314",
      //     },
      //   });
        const paymentMethod = await stripe.paymentMethods.create({
          type: "card",
          card: {
            token: req.body.source,
            // token: token.id
          },
        });
    
        if (!paymentMethod.created){
          return res.status(403).send({
            status: "fail",
            message: "Payment method not created"
          });
        }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((req.body.price + req.body.shippingFee) * 100),
        currency: 'usd',
        payment_method_types: ["card"],
        payment_method: paymentMethod.id,
        confirm: true,
        capture_method: "manual",
      });
  
      if (paymentIntent.created) {
        console.log("payment created", paymentIntent);
        console.log(req.user);

        const placeBid = await placebid.create({
          product: req.body.product,
          user: req.user.id,
          price: req.body.price,
          intentId: paymentIntent.id,
          orderDetails: {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            location: req.body.location,
            shippingFee: req.body.shippingFee,
          }
        });

        let data = {
          user: product.user,
          product: product.id,
          text: `New bid placed on your product ${product.title}`,
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
          // .then((json) => console.log("json ", json))
          .catch((error) => {
            console.log(error);
          });
        
  
        
        return res.status(201).json({
          status: 'success',
          message: 'Bidding is created successfully',
          data: placeBid,
        });
      } else {
        return res.status(400).json({
          status: "fail",
          message: "Stripe error",
        });
      }
    }
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllplacebid = async (req, res) => {
  try {
    const getAllplacebid = await placebid.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: null,
          product: {
            $addToSet: "$product"
          },
        }
      },
      {
        $limit: 1
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "placebids",      
            localField: "product",   
            foreignField: "product",
            pipeline: [
              {
                $sort: {
                  createdAt: -1
                }
              },
              {
                $limit: 1
              },
            ],
            as: "userBid" 
        },    
      },
      {
        $lookup: {
          from: "placebids",      
            localField: "product",   
            foreignField: "product",
            pipeline: [
              {
                $sort: {
                  createdAt: -1
                }
              },
              {
                $match: {
                  user: {
                    $ne: mongoose.Types.ObjectId(req.user.id)
                  }
                }
              },
            ],
            as: "bids" 
        },    
      },
      {
        $lookup: {
          from: "products",      
          localField: "product",   
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
    ]);
    console.log(getAllplacebid.length)

    res.status(200).json({
      status: 'success',
      length: getAllplacebid.length,
      data: getAllplacebid,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllplacebidOfSpecficProduct = async (req, res) => {
  try {
    const getAllplacebid = await placebid.find({ product: req.params.productId }).populate('user').populate('product');
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
      .find({
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
