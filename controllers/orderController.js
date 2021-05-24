const Order = require("../models/orderModal");
const Cart = require("../models/cartModal");
const Product = require("../models/productModal");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

exports.createOrder = async (req, res) => {
  try {
    console.log("req.boy", req.body);
    const cart = await Cart.findById(req.params.cartId);
    if (!cart.selectedProducts) {
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
    const charge = await stripe.charges.create({
      amount: req.body.price * 100,
      currency: "usd",
      source: req.body.source,
    });
    if (charge.paid) {
      console.log('0.1')
      console.log(cart.products)
      cart.products.map(async (i, index) => {
        console.log('1')
        let updatedProduct = await Product.findByIdAndUpdate(
          i,
          { status: "sold" },
          { new: true }
        );
        console.log('2')
        let data = {
          user: updatedProduct.user,
          product: updatedProduct.id,
          text: `Your product ${updatedProduct.title} has been sold`
        };
        console.log('check2',data);
        console.log('check2',updatedProduct);
        fetch('http://localhost:8000/api/v1/notification', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
          .then(json => console.log(json));
      });
      console.log(cart.selectedProducts);
      const createOrderTable = await Order.create(
        {
          name: req.body.name,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          location: req.body.location,
          user: req.user.id,
          cartId: cart._id,
          checkoutId: charge.balance_transaction,
          status: "sold",
          productId: cart.selectedProducts,
        }
        // { $push: { productId: cart.selectedProducts } }
      );
      console.log("createdOrderTable");
      await Cart.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: cart.products } } }
      );
      cart.selectedProducts = undefined;
      await cart.save({ validateBeforeSave: false });

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
      message: err,
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
      const updatedProduct = await Product.findOneAndUpdate(req.body.productId, { status: 'sold' });

      //let product = await Product.findById(req.body.productId);

      let data = {
        user: updatedProduct.user,
        product:updatedProduct.id,
        text: `Your product ${updatedProduct.title} has been sold`
      };
    
      fetch('http://localhost:8000/api/v1/notification', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json())
        .then(json => console.log(json));

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
