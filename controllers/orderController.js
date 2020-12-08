const Order = require('../models/orderModal');
const Cart = require('../models/cartModal');
const Product = require('../models/productModal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId);
    if (!cart.selectedProducts) {
      res.status(400).json({
        status: 'fail',
        message: 'There is no products selected for checkout!',
      });
    }
    if (cart.user.toString() !== req.user.id) {
      res.status(400).json({
        status: 'fail',
        message: 'You dont have an access to perform this action',
      });
    }
    const charge = await stripe.charges.create({
      amount: req.body.price * 100,
      currency: 'usd',
      source: req.body.source,
    });
    if (charge.paid) {
      cart.products.map(async (i, index) => {
        const updatedProduct = await Product.findByIdAndUpdate(
          i,
          { status: 'SOLD' },
          { new: true }
        );
      });
      const createOrderTable = await Order.create({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        user: req.user.id,
        cartId: cart._id,
        checkoutId: charge.balance_transaction,
        status: 'SOLD',
      });
      await Cart.updateOne(
        {
          user: req.user.id,
        },
        { $pull: { products: { $in: cart.products } } }
      );
      cart.selectedProducts = undefined;
      await cart.save({ validateBeforeSave: false });
      res.status(200).json({
        status: 'success',
        message: 'Product is purchased successfully',
        data: createOrderTable,
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Stripe error',
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
      status: 'fail',
      message: err,
    });
  }
};
