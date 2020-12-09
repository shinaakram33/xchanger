const Bidding = require('../models/biddingModal');
const { getAllBrands } = require('./brandController');
exports.createBidding = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide body of a Bid',
      });
    }

    const newBidding = await Bidding.create({
      productprice: req.body.productprice,
      user: req.params.userid,
      bidBy: req.user.id,
      image: req.body.image,
      condition: req.body.condition,
      productAuthentiaction: req.body.productAuthentiaction,
      adTitle: req.body.adTitle,
      addescription: req.body.addescription,
      setPrice: req.body.setPrice,
      location: req.body.location,
      contact: req.body.contact,
      name: req.body.name,
      email: req.body.email,
      // maxPrice: req.body.maxPrice,
      // minPrice: req.body.minPrice,
      price: {
        min: req.body.price.min,
        max: req.body.price.max,
      },
      time: {
        to: req.body.time.to,
        from: req.body.time.from,
      },
    });
    res.status(201).json({
      status: 'success',
      Bidding: newBidding,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getAllbidding = async (req, res) => {
  try {
    const getAllbidding = await Bidding.find(req.user.bidByid);
    res.status(200).json({
      status: 'success',
      length: getAllbidding.length,
      data: getAllbidding,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
