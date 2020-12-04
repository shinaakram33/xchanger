const RecentView = require('../models/recentViewModal');

exports.createRecentViews = async (req, res, next) => {
  try {
    let data = '';
    const alreadyExist = await RecentView.findOne({ user: req.user.id });
    if (!alreadyExist) {
      await RecentView.create({
        user: req.user.id,
        products: req.body.products,
      });
    } else {
      await alreadyExist.products.forEach((i, index) => {
        if (i.toString() === req.body.products) {
          data = 'aaaa';
          next();
        }
      });
      if (data === '') {
        await RecentView.updateOne(
          {
            user: req.user.id,
          },
          { $push: { products: req.body.products } }
        );
      }
    }
    res.status(201).json({
      status: 'success',
      message: 'Added into recent Views successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getRecentViews = async (req, res) => {
  try {
    const getAllRecentViews = await RecentView.findOne({ user: req.user.id }).populate('products');
    res.status(200).json({
      status: 'success',
      data: getAllRecentViews,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
