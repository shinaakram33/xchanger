const placebid = require('../models/placebidModal');
const Bidding = require('../models/biddingModal');

exports.createplaceBid = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        status: 'fail',
        message: 'provide body of product',
      });
    }
    
    console.log("product id", req.body.product)
    const biddingProduct = await Bidding.findOne({"product":req.body.product });
    console.log(biddingProduct);
    if (!biddingProduct) {
      return res.status(400).json({
        status: 'Fail',
        message: 'Product not found',
      });
    }
    else if (biddingProduct.price < req.body.price)
    {
      res.status(400).json({
        status:"fails",
        message:"Entering biding price is greater than product existing price!"
      })
    }
    else{
      const placeBid = await placebid.create({
        product: req.body.product,
        user: req.user.id,
        price: req.body.price,
      });
      biddingProduct.bidByUser.push(placeBid._id);
      biddingProduct.save();
      res.status(201).json({
        status: 'success',
        data: placeBid,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllplacebid = async (req, res) => {
  try {
    const getAllplacebid = await placebid.find().populate('user').populate('product');
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
      .findOne({
        user: req.user.id,
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

// exports.getTotalbid = async (req, res) => {
//   console.log('aaaaaaaaaaaaaaaaaa');
//   try {
//     const getTotalbid = await placebid.find({ product: { $in: req.params.productId } });
//     console.log(req.params.productId);

//     if (!getTotalbid) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'user does not exist',
//       });
//     }
//     res.status(200).json({
//       status: 'success',
//       length: getTotalbid.length,
//       data: getTotalbid,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };
