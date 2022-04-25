const Order = require("../models/orderModal");
const Cart = require("../models/cartModal");
const Product = require("../models/productModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fetch = require("node-fetch");
const User = require("../models/userModal");
const moment = require("moment");
const schedule = require("node-schedule");
const placebid = require("../models/placebidModal");
const RecentView = require("../models/recentViewModal");
const Wishlist = require("../models/wishlistModal");


exports.createOrder = async (req, res) => {
  try {
    console.log("req.boy", req.body);
    console.log("params ", req.params.cartId);
    const cart = await Cart.findById(req.params.cartId);
    console.log(JSON.stringify(cart));
    if (cart.selectedProducts.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "There is no products selected for checkout!",
      });
    }
    if (cart.user.toString() !== req.user.id) {
      return res.status(400).json({
        status: "fail",
        message: "You dont have an access to perform this action",
      });
    }
    if (!req.body.source) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // const token = await stripe.tokens.create({
    //   card: {
    //     number: "4242424242424242",
    //     exp_month: 1,
    //     exp_year: 2023,
    //     cvc: "314",
    //   },
    // });
    console.log(token.id);

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: req.body.source,
        // token: token.id,
      },
    });
    console.log("paymentMethod ", paymentMethod);

    if (!paymentMethod.created)
      return res.status(403).send("Payment method not created");

    let string = (new Date()).toISOString();
    console.log(string, typeof string);

    // let shippingFee;
    //   const { pakageSize } = await cart.selectedProducts.reduce(async function(a, b) {
    //     if(b.pakageSize && a.pakageSize === undefined){
    //       a = await Product.findById(a);
    //     }
    //     else if (a.pakageSize && b.pakageSize === undefined){
    //       b = await Product.findById(b);
    //     }
    //     if (a === null || a.pakageSize.price < b.pakageSize.price){
    //       return b;
    //     }
    //     else{
    //       return a;
    //     }
    //   }, await Product.findById(cart.selectedProducts[0]));
    //   console.log(pakageSize.price);

    // shippingFee = pakageSize.price;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((req.body.price + req.body.shippingFee) * 100),
      currency: 'CHF',
      payment_method_types: ["card"],
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: "manual",
      transfer_group: string
    });

    // const charge = await stripe.charges.create({
    //   amount: req.body.price * 100,
    //   currency: "usd",
    //   source: req.body.source,
    // });

    if (paymentIntent.created) {
      console.log("payment created", paymentIntent);
      console.log('=====', paymentIntent.charges);
    
    let orderNumber = Math.random().toString(36).slice(5)
    let checkExistingOrderNumber = await Order.findOne({orderNumber: orderNumber})

    while(checkExistingOrderNumber != null){
      orderNumber = Math.random().toString(36).slice(5)
      checkExistingOrderNumber = await Order.findOne({orderNumber: orderNumber})
    }
    
    const createOrderTable = await Order.create({
      name: req.body.name,
      email: req.body.email.trim().toLowerCase(),
      phoneNumber: req.body.phoneNumber,
      location: req.body.location,
      user: req.user.id,
      cartId: cart._id,
      checkoutId: paymentIntent.id,
      status: "Pending",
      price: req.body.price,
      orderNumber: orderNumber,
      shippingFee: req.body.shippingFee,
    });
    console.log("createdOrderTable");

    cart.selectedProducts.map(async (i) => {
      console.log("map", i);
      let updatedProduct = await Product.findByIdAndUpdate(
        i,
        { status: "Pending" },
        { new: true }
      );
      console.log("product updated", updatedProduct);

      createOrderTable.productId.push(updatedProduct.id);
      console.log("product array ", createOrderTable.productId);

      cart.products.splice(cart.products.indexOf(i), 1);
      // await Cart.updateOne(
      //   {
      //     user: req.user.id,
      //   },
      //   { $pull: { products: { $in: cart.selectedProducts } } }
      // );
      console.log('selected products', cart.selectedProducts)
      cart.selectedProducts = undefined;
      
      let data = {
        user: updatedProduct.user,
        product: updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been bought`,
      };
      console.log("check2", data);
      console.log("check2", updatedProduct);
      fetch("https://x-changer.herokuapp.com/api/v1/notification", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          try {
            console.log("res ", res);
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
      console.log("status ", paymentIntent.status);
    });
    await cart.save({ validateBeforeSave: false });
    await RecentView.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: cart.selectedProducts } } }
    );
    await Wishlist.updateOne(
      {
        user: req.user.id,
      },
      { $pull: { products: { $in: cart.selectedProducts } } }
    );
    cart.selectedProducts = undefined;
    await cart.save({ validateBeforeSave: false });
    await createOrderTable.save().then(o => o.populate("productId").execPopulate());
    console.log(cart);

    return res.status(200).json({
      status: "success",
      message: "Product is ordered successfully",
      data: createOrderTable,
    });

  } else {
    res.status(400).json({
      status: "fail",
      message: "Stripe error",
    });
  }

    // const session = await stripe.customers
    //   .create({
    //     email: req.user.email,
    //     // source: req.user.id,
    //   })
    //   .then((customer) => {
    //     console.log('customer', customer);
    //     stripe.checkout.sessions.create({
    //       payment_method_types: ['card'],
    //       amount: req.body.price * 100,
    //       currency: 'usd',
    //       customer: customer.id,
    //       receipt_email: req.user.email,
    //       description: 'Product is purchased',
    //       shipping: {
    //         name: req.user.name,
    //         address: { country: req.body.country },
    //       },
    //     });
    //   })
    //   .then((result) =>
    //     res.status(200).json({
    //       status: 'success',
    //       message: 'Product is purchased successfully',
    //     })
    //   );
    //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    //     const session = stripe.checkout.sessions
    //       .create({
    //         payment_method_types: ['card'],
    //         success_url: 'https://www.google.com',
    //         cancel_url: 'https://www.google.com',
    //         customer_email: req.user.email,
    //         client_reference_id: req.params.cartId,
    //         line_items: [
    //           {
    //             name: 'Aqil',
    //             description: 'aaaaaa',
    //             amount: req.body.price * 100,
    //             currency: 'usd',
    //             quantity: 1,
    //           },
    //         ],
    //       })
    //       .then(() => {
    //         res.status(200).json({
    //           status: 'success',
    //           message: 'Product is purchased successfully',
    //         });
    //       });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createImmediateOrder = async (req, res) => {
  let updatedProduct;
  try {
    console.log("req.body", req.body);

    if (!req.body.source) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // const token = await stripe.tokens.create({
    //   card: {
    //     number: "4242424242424242",
    //     exp_month: 1,
    //     exp_year: 2023,
    //     cvc: "314",
    //   },
    // });

    const charge = await stripe.charges.create({
      amount: (req.body.price + req.body.shippingFee) * 100,
      currency: "CHF",
      source: req.body.source,
      // source: token.id,
    });

    if (!charge) {
      return res.status(403).send({
        status: "fail",
        message: "Payment method not created"
      });
    }
      
    if (charge.paid) {
        updatedProduct = await Product.findById(req.body.productId);
        updatedProduct.status = 'Sold';
        await updatedProduct.save();
        console.log(updatedProduct);
        

      //let product = await Product.findById(req.body.productId);

      const order = await Order.create({
        name: req.body.name,
        email: req.body.email.trim().toLowerCase(),
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        user: req.user.id,
        checkoutId: charge.id,
        status: "Complete",
        accepted: true,
        price: req.body.price,
        productId: req.body.productId,
        shippingFee: req.body.shippingFee,
      }).then(o => o.populate("productId").execPopulate());
      console.log("Order", order);
      
      const productSeller = await User.findById(updatedProduct.user);
      console.log(productSeller);
      console.log('seller', productSeller.connAccount);

      let allBidsOfProduct = await placebid.find({product: updatedProduct.id})
      .sort({price: -1, createdAt: -1});
      console.log(allBidsOfProduct.length, allBidsOfProduct);

      allBidsOfProduct.forEach(async (bid) => {
        await stripe.paymentIntents.cancel(bid.intentId);
        await placebid.deleteOne({_id: bid.id});
      });
      
      //send notification to other users
      let failedBidUsers = await placebid.distinct('user', {"product": updatedProduct.id});
      console.log('failedBidUsers', failedBidUsers);
      failedBidUsers.forEach((user) => {
        let data = {
          user: user,
          product: updatedProduct.id,
          text: `Your bid on product ${updatedProduct.title} failed. The product has been sold`,
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
      })
      

      let data = {
        user: updatedProduct.user,
        product: updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been sold. Buyer details: Name: ${order.name}, Email: ${order.email}, Phone: ${order.phone}, Location: ${order.location}`,
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
      console.log("Check 2", updatedProduct);

      console.log('--------------------------------------');
      // try{
      //     let transfer = await stripe.transfers.create({
      //     amount: Math.round(updatedProduct.price.immediate_purchase_price * 100),
      //       currency: 'CHF',
      //       destination: productSeller.connAccount.id,
      //       source_transaction: charge.id,
      //     });
      //     console.log(transfer);
      // } catch (err) {
      //   console.log(err);
      //   let admin = User.findOne({roles: 'admin'});
      //   let data = {
      //     user: admin.id,
      //     product: updatedProduct.id,
      //     text: `Transfer unsuccessful: Seller: ${updatedProduct.user}, Amount: ${updatedProduct.price}, Order: ${order.id}`,
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

      return res.status(200).json({
        status: "success",
        message: "Product is purchased successfully",
        data: order,
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Stripe error",
      });
    }
  } catch (err) {
    console.log(err.message);
    updatedProduct.status = 'Not sold';
    await updatedProduct.save();
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};


exports.orderAccepted = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    // const userId = req.user.id;

    // const user = await User.findById(userId);
    // if (!user) return res.status(401).send("User does not exist.");

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(403).json({
        status: "fail",
        message: "Order does not exists",
      });
    }

    if(order.status === 'Complete'){
      return res.status(403).json({
        status: "fail",
        message: "Order is already completed",
      });
    }
    // if (order.user != user.id)
    //   return res.status(403).send("Order ID doesn't match");

    const accepted = req.body.accepted;
    if (accepted) {
      const paymentIntentCapture = await stripe.paymentIntents.capture(
        order.checkoutId,
      );
      console.log(paymentIntentCapture);
      order.accepted = true;
      order.status = "Complete";
      console.log("status ", paymentIntentCapture.status);
      if (paymentIntentCapture.status === "succeeded") {
        order.productId.map(async (i, index) => {
          console.log("1");
          let updatedProduct = await Product.findByIdAndUpdate(
            i,
            { status: "Sold" },
            { new: true }
          );
          console.log("2");
          console.log('--------------------------------------------------');
          
          console.log('user', updatedProduct.user);
          let productUser = await User.findById(updatedProduct.user);
          console.log('account', productUser.connAccount.id);
          console.log(updatedProduct.price);
          console.log(paymentIntentCapture.transfer_group);
          console.log(paymentIntentCapture.id);
          // try{
          //   let transfer = await stripe.transfers.create({
          //     amount: updatedProduct.price.sellingPrice * 100,
          //     currency: 'CHF',
          //     destination: productUser.connAccount.id,
          //     source_transaction: paymentIntentCapture.charges.data[0].id,
          //     transfer_group: paymentIntentCapture.transfer_group
          //   });
          //   console.log(transfer);
          // } catch (err) {
          //   console.log(err);
          // let admin = User.findOne({roles: 'admin'});
          //   let data = {
          //     user: admin.id,
          //     product: updatedProduct.id,
          //     text: `Transfer unsuccessful: Seller: ${updatedProduct.user}, Amount: ${updatedProduct.price}, Order: ${order.id}`,
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
          console.log('--------------------------------------------------');
          let data = {
            user: updatedProduct.user,
            product: updatedProduct.id,
            text: `Your product ${updatedProduct.title} has been sold. Buyer details: Name: ${order.name}, Email: ${order.email}, Phone: ${order.phone}, Location: ${order.location}`,
          };
          // console.log("check2", data);
          // console.log("check2", updatedProduct);
          fetch("https://x-changer.herokuapp.com/api/v1/notification", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              try {
                // console.log("res ", res);
                const dataa = await res.json();
                // console.log("response data?", dataa);
              } catch (err) {
                console.log("error");
                console.log(err);
              }
            })
            // .then((json) => console.log("json ", json))
            .catch((error) => {
              console.log(error);
            });
        });
        await order.save();
        return res.status(200).json({
          status: "success",
          message: "Product is purchased successfully",
          data: order,
        });
      } else {
        return res.status(400).json({
          status: "fail",
          message: "Stripe error",
        });
      }
    } else {
      const paymentIntentCancel = await stripe.paymentIntents.cancel(
        order.checkoutId
      );
      console.log("status ", paymentIntentCancel.status);
      if (paymentIntentCancel.status === "canceled") {
        order.accepted = false;
        order.status = "Rejected";
        order.productId.map(async (i, index) => {
          try {
            console.log("1");
            let updatedProduct = await Product.findByIdAndUpdate(
              i,
              { status: "Not sold" },
              { new: true }
            );
            console.log("2");
            let data = {
              user: updatedProduct.user,
              product: updatedProduct.id,
              text: `Your product ${updatedProduct.title} has been rejected`,
            };
            console.log("check2", data);
            console.log("check2", updatedProduct);
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
          } catch (err) {
            return res.status(400).json({
              status: "fail",
              message: err.message,
            });
          }
        });
        await order.save();
      } else {
        return res.status(400).json({
          status: "fail",
          message: "Stripe error",
        });
      }
    }
    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.roles === 'admin') {
      const allOrders = await Order.find()
      .sort({"createdAt": -1})
      .populate("user")
      .populate({path: "cartId", populate: {path: "products", model: "Product", }, populate: {path: "selectedProducts", model: "Product"}})
      .populate("productId");
      res.status(200).json({
        status: "success",
        length: allOrders.length,
        data: allOrders,
      });
    } else {
      const allOrders = await Order.find({ user: req.user.id })
      .sort({"createdAt": -1})
      .populate("user")
      .populate({path: "cartId", populate: {path: "products", model: "Product", }, populate: {path: "selectedProducts", model: "Product"}})
      .populate("productId");
      res.status(200).json({
        status: "success",
        length: allOrders.length,
        data: allOrders,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      status: "Pending",
    })
    .sort({"createdAt": -1})
    .populate("productId");
    if (!orders) return res.status(201).send("No pending orders.");

    return res.status(200).json({
      status: "success",
      length: orders.length,
      data: orders,
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
      const id = req.params.orderId;
      if(!id) {
          return res.status(400).json({
              status: 'fail',
              message: 'Order id is required',
            });
      }
      const order = await Order.findById(id)
      .populate("user")      
      .populate({path: "cartId", populate: {path: "products", model: "Product", }, populate: {path: "selectedProducts", model: "Product"}})
      .populate("productId");
      if (!order) {
          return res.status(200).json({
              status: 'successful',
              message: 'Order does not exist',
            });
      }
      res.status(201).json({
          status: 'success',
          TermCondition: order
      });
} catch (err) {
  res.status(400).json({
    status: 'fail',
    message: err,
  });
}
}

exports.updateOrder = async (req, res) => {
  try {
      const id = req.params.orderId;
      const updates = req.body;
      if(!id) {
          return res.status(400).json({
              status: 'fail',
              message: 'Order id is required',
            });
      }
      const order = await Order.findById(id);
      if (!order) {
          return res.status(200).json({
              status: 'fail',
              message: 'Order does not exist',
            });
      }
      const updated_order = await Order.findByIdAndUpdate(id, updates, { new: true })
      .populate("user")
      .populate({path: "cartId", populate: {path: "products", model: "Product", }, populate: {path: "selectedProducts", model: "Product"}})
      .populate("productId");
      res.status(201).json({
          status: 'success',
          data: updated_order
      });
} catch (err) {
  res.status(400).json({
    status: 'fail',
    message: err,
  });
}
}

exports.deleteOrder = async (req, res) => {
  try {
      const id = req.params.orderId;
      if(!id) {
          return res.status(400).json({
              status: 'fail',
              message: 'Order id is required',
            });
      }
      const order = await Order.findById(id);
      if (!order) {
          return res.status(200).json({
              status: 'successful',
              message: 'Order does not exist',
            });
      }
      const deleted_order = await Order.findByIdAndDelete(id);
      res.status(201).json({
          status: 'success',
          message: 'Order deleted successfully',
          data: deleted_order
      });
} catch (err) {
  res.status(400).json({
    status: 'fail',
    message: err,
  });
}
}

exports.searchOrder = async (req, res) => {
  try {
    let searchCriteria = {}

    if (req.query.status) {
      searchCriteria.status = req.query.status.toLowerCase();
    }
    if (req.query.accepted) {
      searchCriteria.accepted = req.query.accepted.toLowerCase();
    }
    if (req.query.location) {
      searchCriteria.location = new RegExp(
        ".*" + req.query.location.toLowerCase() + ".*",
        "i"
      );
    }
    if (req.query.orderNumber) {
      searchCriteria.orderNumber = new RegExp(
        ".*" + req.query.orderNumber.toLowerCase() + ".*",
        "i"
      );
    }
    if (req.query.name) {
      searchCriteria.name = new RegExp(
        ".*" + req.query.name.toLowerCase() + ".*",
        "i"
      );
    }
    if (req.query.date) {
      searchCriteria.createdAt = {$gte: new Date(req.query.date), $lte: moment(req.query.date).endOf('day').toDate()}
    }
    

    const orders = await Order.find(searchCriteria)
    .sort({"createdAt": -1})
    .populate("user")
    .populate("cartId")
    .populate("productId");

    return res.status(200).json({
      status: 'successful',
      orders: orders,
    });


  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
}

exports.getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if(!user){
      return res.status(400).json({
        status: 'fail',
        message: 'User does not exist',
      });
    }
    const userOrders = await Order.find({ user: req.params.userId })
    .sort({"createdAt": -1})
    .populate("user")
    .populate({path: "cartId", populate: {path: "products", model: "Product", }, populate: {path: "selectedProducts", model: "Product"}})
    .populate("productId");
    if (!userOrders) {
      return res.status(400).json({
        status: 'fail',
        message: 'No orders exists',
      });
    }
    res.status(200).json({
      status: 'success',
      length: userOrders.length,
      data: userOrders,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
      const id = req.params.orderId;
      const status = req.body.status;
      if(!id) {
          return res.status(400).json({
              status: 'fail',
              message: 'Order id is required',
            });
      }
      const order = await Order.findById(id);
      if (!order) {
          return res.status(200).json({
              status: 'fail',
              message: 'Order does not exist',
            });
      }
      if(order.status === 'Pending') {
        return res.status(200).json({
          status: 'fail',
          message: 'Your order needs to be approved by admin',
        });
      }
      if(!status) {
        return res.status(400).json({
            status: 'fail',
            message: 'Status is required',
          });
      }
      order.status = status;
      await order.save().then(o => o.populate("productId").execPopulate());
      console.log(order);
      let userText, sellerText;
      if(status === 'Dispatched') {
        userText = `Your order ${order.id} has been dispatched.`;
        sellerText = `You dispatched order ${order.id}.`;
      }
      else if(status === 'Shipped') {
        userText = `Your order ${order.id} has been shipped.`;
        sellerText = `You shipped order ${order.id}.`;
      }
      else if(status === 'Received') {
        userText = `Your order ${order.id} has been received.`;
        sellerText = `Your order ${order.id} has been received by the buyer.`;
      }
      let userData = {
        user: order.user,
        order: order.id,
        text: userText,
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

      order.productId.forEach(async (o) => {
        let sellerData = {
          user: o.user,
          order: order.id,
          text: sellerText,
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
      });
      
      res.status(201).json({
          status: 'success',
          message: 'Order status updated',
      });
} catch (err) {
  res.status(400).json({
    status: 'fail',
    message: err,
  });
}
}
