const placebid = require('../models/placebidModal');
const Product = require('../models/productModal');
const User = require("../models/userModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const schedule = require("node-schedule");
const moment = require('moment');
const fetch = require("node-fetch");
const mongoose = require('mongoose');

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
    const biddingProduct = await Product.findById(req.body.product);
    console.log(biddingProduct);
    if (!biddingProduct) {
      return res.status(400).json({
        status: 'Fail',
        message: 'Product not found',
      });
    // } else if (biddingProduct.price.immediate_purchase_price < req.body.price) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'Price must be greater than or equal to immediate purchase price',
    //   });
    } else {
      const placeBid = await placebid.create({
        product: req.body.product,
        user: req.user.id,
        price: req.body.price,
      });
  
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
          },
        });
    
        if (!paymentMethod.created){
          return res.status(403).send({
            status: "fail",
            message: "Payment method not created"
          });
        }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(req.body.price * 100),
        currency: 'usd',
        payment_method_types: ["card"],
        payment_method: paymentMethod.id,
        confirm: true,
        capture_method: "manual",
      });
  
      if (paymentIntent.created) {
        console.log("payment created", paymentIntent);
        console.log(req.user);
  
        let product = await Product.findById(req.body.product);
        console.log(product);
        console.log(product.date_for_auction);
  
        let min = moment(product.date_for_auction.ending_date).minutes();
        let hour = moment(product.date_for_auction.ending_date).hours();
        let day = moment(product.date_for_auction.ending_date).format('D');
        let month = moment(product.date_for_auction.ending_date).format('M');
        let year = moment(product.date_for_auction.ending_date).format('Y');
  
        console.log(min, (hour), day, month, year)
  
        let paymentIntentCaptureJob = schedule.scheduleJob(`${min} ${hour} ${day} ${month} *`, async () => {
          console.log('Cron job executed.')
          
          const paymentIntentCapture = await stripe.paymentIntents.capture(
            paymentIntent.id
          );
          console.log(paymentIntentCapture);
          if (paymentIntentCapture.status === "succeeded") {
  
            console.log("status ", paymentIntentCapture.status);
            product.status = 'sold';
            await product.save();
                              
            const productSeller = await User.findById(product.user);
            console.log(productSeller);
  
            const transfer = await stripe.transfers.create({
              amount: Math.round((req.body.price - req.body.shippingFee) * 100),
              currency: 'usd',
              destination: productSeller.connAccount.id,
              source_transaction: paymentIntentCapture.charges.data[0].id,
            });
            console.log(transfer);
  
            let data = {
              user: product.user,
              product: product.id,
              text: `Your product ${product.title} has been sold`,
            };
  
            fetch("https://clothingsapp.herokuapp.com/api/v1/notification", {
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
          } else {
            return res.status(400).json({
              status: "fail",
              message: "Stripe error",
            });
          }
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
        $lookup: {
          from: "placebids",      
            localField: "product",   
            foreignField: "product",
            as: "bids" 
        },    
      },
    ]);
    await placebid.populate(getAllplacebid, {path: 'product'});

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
