const DummyModal = require('../models/dummyModal');

exports.getDummyData = async (req, res) => {
  try {
    const data = await DummyModal.find();
    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { tour: data },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createDummyData = async (req, res) => {
  try {
    const newData = await DummyModal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateDummyData = async (req, res) => {
  try {
    const data = await DummyModal.findById(req.params.proId);
    if (!data) {
      res.status(400).json({
        status: 'fail',
        message: 'category does not exist',
      });
    }
    const updateData = await DummyModal.findByIdAndUpdate(req.params.proId, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'success',
      message: 'category is updated successfully',
      data: updateData,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};


