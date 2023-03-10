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
    const cart = await Cart.findById(req.params.cartId);
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

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: req.body.source,
        // token: token.id,
      },
    });

    if (!paymentMethod.created)
      return res.status(403).send("Payment method not created");

    let ownMoney = 0
    if (parseInt(req.body.price) > 0 && parseInt(req.body.price) <=150) {
      ownMoney = parseInt(((4/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 150 && parseInt(req.body.price) <= 1000) {
      ownMoney = parseInt(((7/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 1000 && parseInt(req.body.price) <= 2000) {
      ownMoney = parseInt(((6/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 1000 && parseInt(req.body.price) <= 2000) {
      ownMoney = parseInt(((6/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 2000 && parseInt(req.body.price) <= 4000) {
      ownMoney = parseInt(((5.5/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 4000 && parseInt(req.body.price) <= 10000) {
      ownMoney = parseInt(((5/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 10000) {
      ownMoney = parseInt(((4/100) * parseInt(req.body.price)) + 11.5)
    }
    let string = (new Date()).toISOString();
     const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((req.body.price + req.body.shippingFee) * 100),
      currency: 'CHF',
      payment_method_types: ["card"],
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: "manual",
      transfer_group: string,
      transfer_data: {
        amount: Math.round((ownMoney + req.body.shippingFee) * 100),
        destination: "acct_1LU5BKQdU47nz4ap",
      },
    });

    const transfer = await stripe.transfers.create({
      amount: Math.round((ownMoney + req.body.shippingFee) * 100),
      currency: 'CHF',
      destination: 'acct_1LU5BKQdU47nz4ap',
      transfer_group: string,
    });

    if (paymentIntent.created) {
    
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

    cart.selectedProducts.map(async (i) => {
      let updatedProduct = await Product.findByIdAndUpdate(
        i,
        { status: "Pending" },
        { new: true }
      );
      createOrderTable.productId.push(updatedProduct.id);

      cart.products.splice(cart.products.indexOf(i), 1);
  
      cart.selectedProducts = undefined;
      
      let data = {
        user: updatedProduct.user,
        product: updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been sold to: ${createOrderTable.name}.`,
      };

      fetch("https://x-changer.herokuapp.com/api/v1/notification", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          try {
            const dataa = await res.json();
          } catch (err) {
          }
        })
        .catch((error) => {
        });
    });
    await cart.save({ validateBeforeSave: false });
    let recentView = await RecentView.findOne({ user: req.user.id });
    if(recentView){
      await RecentView.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: createOrderTable.productId } } }
    );
    }
    let wishList = await Wishlist.findOne({ user: req.user.id });
    if(wishList){
      await Wishlist.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: createOrderTable.productId } } }
      );
    }
    cart.selectedProducts = undefined;
    await cart.save({ validateBeforeSave: false });
    await createOrderTable.save().then(o => o.populate({path: "productId", populate: "user"}).execPopulate());

    

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

    if (!req.body.source) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }


    let ownMoney = 0
    if (parseInt(req.body.price) > 0 && parseInt(req.body.price) <=150) {
      ownMoney = parseInt(((4/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 150 && parseInt(req.body.price) <= 1000) {
      ownMoney = parseInt(((7/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 1000 && parseInt(req.body.price) <= 2000) {
      ownMoney = parseInt(((6/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 1000 && parseInt(req.body.price) <= 2000) {
      ownMoney = parseInt(((6/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 2000 && parseInt(req.body.price) <= 4000) {
      ownMoney = parseInt(((5.5/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 4000 && parseInt(req.body.price) <= 10000) {
      ownMoney = parseInt(((5/100) * parseInt(req.body.price)) + 11.5)
    } else if (parseInt(req.body.price) > 10000) {
      ownMoney = parseInt(((4/100) * parseInt(req.body.price)) + 11.5)
    }

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: req.body.source,
        // token: token.id,
      },
    });

    if (!paymentMethod.created)
      return res.status(403).send("Payment method not created");

    let string = (new Date()).toISOString();

    const charge = await stripe.paymentIntents.create({
      amount: Math.round((req.body.price + req.body.shippingFee) * 100),
      currency: 'CHF',
      payment_method_types: ["card"],
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: "manual",
      transfer_group: string,
      transfer_data: {
        amount: Math.round((ownMoney + req.body.shippingFee) * 100),
        destination: "acct_1LU5BKQdU47nz4ap",
      },
    });

    const transfer = await stripe.transfers.create({
      amount: Math.round((ownMoney + req.body.shippingFee) * 100),
      currency: 'CHF',
      destination: 'acct_1LU5BKQdU47nz4ap',
      transfer_group: string,
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
      }).then(o => o.populate({path: "productId", populate: "user"}).execPopulate())

      
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
      
      const productSeller = await User.findById(updatedProduct.user);

      let allBidsOfProduct = await placebid.find({product: updatedProduct.id})
      .sort({price: -1, createdAt: -1});

      allBidsOfProduct.forEach(async (bid) => {
        await stripe.paymentIntents.cancel(bid.intentId);
      });
      
      //send notification to other users
      let failedBidUsers = await placebid.distinct('user', {"product": updatedProduct.id});
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
            } catch (err) {
            }
          })
          .catch((error) => {
          });
      })
      

      let data = {
        user: updatedProduct.user,
        product: updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been sold to: ${order.name}.`,
      };

      fetch("https://x-changer.herokuapp.com/api/v1/notification", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          try {
            const dataa = await res.json();
          } catch (err) {
          }
        })
        .catch((error) => {
        });

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
    
    const accepted = req.body.accepted;
    if (accepted) {
      const paymentIntentCapture = await stripe.paymentIntents.capture(
        order.checkoutId,
      );
      order.accepted = true;
      order.status = "Complete";
      if (paymentIntentCapture.status === "succeeded") {
        order.productId.map(async (i, index) => {
          let updatedProduct = await Product.findByIdAndUpdate(
            i,
            { status: "Sold" },
            { new: true }
          );
          
          let productUser = await User.findById(updatedProduct.user);
          
          let data = {
            user: updatedProduct.user,
            product: updatedProduct.id,
            text: `Your product ${updatedProduct.title} has been sold to: ${order.name}.`,
          };
          
          fetch("https://x-changer.herokuapp.com/api/v1/notification", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          })
            .then(async (res) => {
              try {
                const dataa = await res.json();
              } catch (err) {
                
              }
            })
            .catch((error) => {
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
      if (paymentIntentCancel.status === "canceled") {
        order.accepted = false;
        order.status = "Rejected";
        order.productId.map(async (i, index) => {
          try {
            let updatedProduct = await Product.findByIdAndUpdate(
              i,
              { status: "Not sold" },
              { new: true }
            );
            let data = {
              user: updatedProduct.user,
              product: updatedProduct.id,
              text: `Your product ${updatedProduct.title} has been rejected`,
            };
            fetch("https://x-changer.herokuapp.com/api/v1/notification", {
              method: "POST",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
            })
              .then(async (res) => {
                try {
                  const dataa = await res.json();
                } catch (err) {
                }
              })
              .catch((error) => {
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
        } catch (err) {
        }
      })
      .catch((error) => {
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
          } catch (err) {
          }
        })
        .catch((error) => {
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
