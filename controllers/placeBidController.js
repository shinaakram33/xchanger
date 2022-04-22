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
          intentId: paymentIntent.id
        });

        let data = {
          user: product.user,
          product: product.id,
          text: `New bid placed on your product ${product.title}`,
        };

        fetch("https://x-changer.herokuapp.com/api/v1/notification/notification", {
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
        
        console.log(product.date_for_auction);
  
        let min = moment(product.date_for_auction.ending_date).minutes();
        let hour = moment(product.date_for_auction.ending_date).hours();
        let day = moment(product.date_for_auction.ending_date).format('D');
        let month = moment(product.date_for_auction.ending_date).format('M');
        let year = moment(product.date_for_auction.ending_date).format('Y');
  
        console.log(min, hour, day, month, year)
        
  
        let paymentIntentCaptureJob = schedule.scheduleJob(`${min} ${hour} ${day} ${month} *`, async () => {
          console.log('Cron job executed.')
          
          const order = await Order.create({
            name: req.body.name,
            email: req.body.email.trim().toLowerCase(),
            phoneNumber: req.body.phoneNumber,
            location: req.body.location,
            user: req.user.id,
            checkoutId: placeBid.intentId,
            status: "Complete",
            price: req.body.price,
            productId: product.id
          }).then(o => o.populate("productId").execPopulate());
          console.log("Order", order);
          product.status = 'Sold';
          await product.save();
          console.log(product);

          //find all bids on the product
          let allBidsOfProduct = await placebid.find({product: product.id})
          .sort({price: -1, createdAt: -1});
          console.log(allBidsOfProduct.length, allBidsOfProduct);

          
          //inform user about purchase
          let highestBid = allBidsOfProduct.shift();
          console.log('highest', highestBid);

          highestBid.succeeded = true;
          
          const paymentIntentCapture = await stripe.paymentIntents.capture(
            highestBid.intentId
          );
          let userData = {
            user: highestBid.user,
            product: product.id,
            text: `Your bid on product ${product.title} has been successful.`,
          };

          fetch("https://x-changer.herokuapp.com/api/v1/notification/notification", {
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
            // .then((json) => console.log("json ", json))
            .catch((error) => {
              console.log(error);
            });
          console.log(paymentIntentCapture);
          if (paymentIntentCapture.status === "succeeded") {
  
            console.log("status ", paymentIntentCapture.status);
                          
            //make payment to seller
            const productSeller = await User.findById(product.user);
            console.log(productSeller);

            // try{
              //     let transfer = await stripe.transfers.create({
              //     amount: Math.round(highestBid * 100),
            //       currency: 'usd',
            //       destination: productSeller.connAccount.id,
            //       source_transaction: paymentIntentCapture.charges.data[0].id,
            //     });
            //     console.log(transfer);
            //   } catch (err) {
            //     console.log(err);
            //   }
  
            let sellerData = {
              user: product.user,
              product: product.id,
              text: `Your  product ${product.title} has been sold`,
            };

            fetch("https://x-changer.herokuapp.com/api/v1/notification/notification", {
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
              // .then((json) => console.log("json ", json))
              .catch((error) => {
                console.log(error);
              });
          } else {
            return res.status(400).json({
              status: "fail",
              message: "Stripe error",
            });
          }


          //delete other bids
          allBidsOfProduct.forEach(async (bid) => {
            await stripe.paymentIntents.cancel(bid.intentId);
            await placebid.deleteOne({_id: bid.id});
          });
          
          //send notification to other users
          let failedBidUsers = await placebid.distinct('user', {"product": product.id});
          console.log('failedBidUsers', failedBidUsers);
          failedBidUsers.forEach((user) => {
            let data = {
              user: user,
              product: product.id,
              text: `Your bid on product ${product.title} failed. The product has been sold`,
            };

            fetch("https://x-changer.herokuapp.com/api/v1/notification/notification", {
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
          })

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
