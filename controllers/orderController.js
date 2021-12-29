const Order = require("../models/orderModal");
const Cart = require("../models/cartModal");
const Product = require("../models/productModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fetch = require("node-fetch");
const User = require("../models/userModal");

exports.createOrder = async (req, res) => {
  try {
    console.log("req.boy", req.body);
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
    if (!req.body.card) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: req.body.card,
    });
    console.log("paymentMethod ", paymentMethod);

    if (!paymentMethod.created)
      res.status(403).send("Payment method not created");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.price * 100,
      currency: "usd",
      payment_method_types: ["card"],
      payment_method: paymentMethod.id,
      confirm: true,
      capture_method: "manual",
    });

    // const charge = await stripe.charges.create({
    //   amount: req.body.price * 100,
    //   currency: "usd",
    //   source: req.body.source,
    // });

    if (paymentIntent.created) {
      console.log("payment created");
      cart.products.map(async (i, index) => {
        console.log("map");
        let updatedProduct = await Product.findByIdAndUpdate(
          i,
          { status: "pending" },
          { new: true }
        );
        console.log("product updated");
        const createOrderTable = await Order.create({
          name: req.body.name,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          location: req.body.location,
          user: req.user.id,
          cartId: cart._id,
          checkoutId: paymentIntent.id,
          status: "pending",
          productId: cart.selectedProducts,
        });
        console.log("createdOrderTable");
        await Cart.updateOne(
          {
            user: req.user.id,
          },
          { $pull: { products: { $in: cart.products } } }
        );
        cart.selectedProducts = undefined;
        await cart.save({ validateBeforeSave: false });

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
              const data = await res.json();
              console.log("response data?", data);
            } catch (err) {
              console.log("error");
              console.log(err);
            }
          })
          .then((json) => console.log("json ", json))
          .catch((error) => {
            console.log(error);
          });

        console.log("status ", paymentIntent.status);
        res.status(200).json({
          status: "success",
          message: "Product is ordered successfully",
          data: createOrderTable,
        });
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
  try {
    console.log("req.boy", req.body);

    if (!req.body.source) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }
    const charge = await stripe.charges.create({
      amount: req.body.price * 100,
      currency: "usd",
      source: req.body.source,
    });
    if (charge.paid) {
      const updatedProduct = await Product.findOneAndUpdate(
        req.body.productId,
        { status: "sold" }
      );

      //let product = await Product.findById(req.body.productId);

      let data = {
        user: updatedProduct.user,
        product: updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been sold`,
      };

      fetch("https://x-changer.herokuapp.com/api/v1/notification", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((json) => console.log(json));

      console.log("Check 2", updatedProduct);

      let createOrderTable = new Order({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        user: req.user.id,
        checkoutId: charge.balance_transaction,
        status: "sold",
        productId: req.body.productId,
      });
      await createOrderTable.save();
      console.log("createdOrderTable");

      res.status(200).json({
        status: "success",
        message: "Product is purchased successfully",
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
      message: err,
    });
  }
};

exports.orderAccepted = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(401).send("User does not exist.");

    const order = await Order.findById(orderId);
    if (!order) return res.status(403).send("Order does not exist.");
    if (order.user != user.id)
      return res.status(403).send("Order ID doesn't match");

    const accepted = req.body.accepted;
    if (accepted) {
      const paymentIntentCapture = await stripe.paymentIntents.capture(
        order.checkoutId
      );
      order.accepted = true;
      order.status = "Sold";
      console.log("status ", paymentIntentCapture.status);
      if (paymentIntentCapture.status === "succeeded") {
        order.productId.map(async (i, index) => {
          console.log("1");
          let updatedProduct = await Product.findByIdAndUpdate(
            i,
            { status: "sold" },
            { new: true }
          );
          console.log("2");
          let data = {
            user: updatedProduct.user,
            product: updatedProduct.id,
            text: `Your product ${updatedProduct.title} has been sold`,
          };
          console.log("check2", data);
          console.log("check2", updatedProduct);
          fetch("https://x-changer.herokuapp.com/api/v1/notification", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => res.json())
            .then((json) => console.log(json));
        });
        await order.save();
        res.status(200).json({
          status: "success",
          message: "Product is purchased successfully",
          data: order,
        });
      } else {
        res.status(400).json({
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
          console.log("1");
          let updatedProduct = await Product.findByIdAndUpdate(
            i,
            { status: "not_sold" },
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
            .then((res) => res.json())
            .then((json) => console.log(json));
        });
      } else {
        res.status(400).json({
          status: "fail",
          message: "Stripe error",
        });
      }
    }
    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({ user: req.user.id })
      .populate("user")
      .populate("cartId")
      .populate("productId");
    res.status(200).json({
      status: "success",
      length: allOrders.length,
      data: allOrders,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
