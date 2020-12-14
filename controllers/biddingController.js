const Bidding = require('../models/biddingModal');
const { getAllBrands } = require('./brandController');
exports.createBidding = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide body of a Product',
      });
    }

    const newBidding = await Bidding.create({
      productprice: req.body.productprice,
      user: req.user.id,
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
      status: req.body.status,

      price: {
        min: req.body.price.min,
        max: req.body.price.max,
      },
      date: {
        to: req.body.date.to,
        from: req.body.date.from,
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
  console.log('aaaaaaaaaaaaaaaaaaa');
  try {
    const getAllbidding = await Bidding.find();
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
exports.getAllPostedstatus = async (req, res) => {
  try {
    const Postedstatus = await Bidding.find({
      status: { $in: req.params.statusId },
    });

    if (!Postedstatus) {
      res.status(400).json({
        status: 'fail',
        message: 'No POSTED status found',
      });
    }
    res.status(200).json({
      status: 'success',
      length: Postedstatus.length,
      data: Postedstatus,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getuserbidding = async (req, res) => {
  try {
    const getuserbidding = await Bidding.find({ user: { $in: req.params.userId } });
    if (!getuserbidding) {
      return res.status(400).json({
        status: 'fail',
        message: 'Products does not exist',
      });
    }
    res.status(200).json({
      status: 'success',
      length: getuserbidding.length,
      data: getuserbidding,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updatebidding = async (req, res) => {
  try {
    const biddingid = req.params.biddingid;
    const updates = req.body;
    const options = { new: true };
    const bidding = await Bidding.findById(req.params.biddingid);

    if (req.user.id !== bidding.user.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'product does not exist',
      });
    }

    const updatedbidding = await Bidding.findByIdAndUpdate(biddingid, updates, options);
    console.log('ssssssssss', updatedbidding);
    res.status(200).json({
      status: 'success',
      message: 'product is updated successfully',
      data: updatedbidding,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
exports.updateByAdmin = async (req, res) => {
  try {
    const updateByAdmin = await Bidding.findById(req.params.productId);
    if (!updateByAdmin) {
      res.status(400).json({
        status: 'fail',
        message: 'No product is found',
      });
    }
    const updatedByAdmin = await Bidding.findByIdAndUpdate(
      req.params.productId,
      {
        status: req.body.status,
        productprice: req.body.productprice,
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
        price: {
          min: req.body.price.min,
          max: req.body.price.max,
        },
        date: {
          to: req.body.date.to,
          from: req.body.date.from,
        },
      },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'product is updated successfully',
      data: updatedByAdmin,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deletebidding = async (req, res) => {
  try {
    const biddingid = req.params.biddingid;
    const bidding = await Bidding.findById(biddingid.toString());
    if (!bidding) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product does not exist',
      });
    }
    if (bidding.user.toString() !== req.user.id) {
      res.status(400).json({
        status: 'fail',
        message: 'Product does not delete',
      });
    }
    const result = await Bidding.findByIdAndDelete(biddingid);
    res.status(200).json({
      status: 'successful',
      message: 'Product delete successfully',
    });
  } catch (error) {
    console.log(message.error);
  }
};
