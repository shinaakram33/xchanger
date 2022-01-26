const TermAndCondition = require('../models/term-conditionModel');


exports.getTermsAndConditions = async (req, res) => {
    try {
      const termsAndConditions = await TermAndCondition.find();
      if (termsAndConditions.length <= 0) {
        return res.status(400).json({
            status: 'Success',
            message: 'No Terms&Conditions exist',
        });
      }
      return res.status(200).json({
        status: 'successful',
        data: termsAndConditions,
      });
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  }

exports.createTermsAndConditions = async (req, res) => {
    try {
        const newTC = await TermAndCondition.create(req.body);
        res.status(201).json({
            status: 'success',
            TermCondition: newTC,
        });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
}
}

exports.getTermAndConditionById = async (req, res) => {
    try {
        const id = req.params.id;
        if(!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Term and Condition id is required',
              });
        }
        const tc = await TermAndCondition.findById(id);
        if (!tc) {
            return res.status(200).json({
                status: 'successful',
                message: 'Term and condition does not exist',
              });
        }
        res.status(201).json({
            status: 'success',
            TermCondition: tc
        });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
}
}

exports.updateTermAndCondition = async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        if(!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Term and Condition id is required',
              });
        }
        const tc = await TermAndCondition.findById(id);
        if (!tc) {
            return res.status(200).json({
                status: 'successful',
                message: 'Term and condition does not exist',
              });
        }
        const updated_tc = await TermAndCondition.findByIdAndUpdate(id, updates, { new: true });
        res.status(201).json({
            status: 'success',
            TermCondition: updated_tc
        });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
}
}

exports.deleteTermAndCondition = async (req, res) => {
    try {
        const id = req.params.id;
        if(!id) {
            return res.status(400).json({
                status: 'fail',
                message: 'Term and Condition id is required',
              });
        }
        const tc = await TermAndCondition.findById(id);
        if (!tc) {
            return res.status(200).json({
                status: 'successful',
                message: 'Term and condition does not exist',
              });
        }
        const deleted_tc = await TermAndCondition.findByIdAndDelete(id);
        res.status(201).json({
            status: 'success',
            message: 'Term and Condition deleted successfully'
        });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
}
}