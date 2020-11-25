const jwt = require('jsonwebtoken');
const User = require('../models/userModal');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'success',
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }
    const user = await User.findOne({ email }).select('+password');
    const correctPassword = await user.correctPassword(password, user.password);
    if (!user || !correctPassword) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
