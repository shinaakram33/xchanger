const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bycript = require('bcryptjs');
const User = require('../models/userModal');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_TOKEN_EXPIRE,
  });
};

exports.signup = async (req, res) => {
  try {
    const alreadyExistEmail = await User.findOne({ email: req.body.email });
    if (alreadyExistEmail) {
      return res.status(404).json({
        status: 'fail',
        message: 'This email is already Exist!',
      });
    } else {
      const newUser = await User.create(req.body);
      const token = signToken(newUser._id);
      res.status(201).json({
        status: 'success',
        token,
        user: newUser,
      });
    }
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
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }
    console.log(email, password);
    const user = await User.findOne({ email });
    // const user = await User.findOne({ email: email }).select('password');
    const correctPassword = await user.correctPassword(password, user.password);
    if (!user || !correctPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }
    const token = signToken(user._id);
    console.log(token);
    res.status(200).json({
      status: 'success',
      token,
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let updates = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User does not exist',
      });
    }

    if(updates.sellerRating){

      if(!user.sellerRating){
        let dummyrating = 0;
      }else{
        let dummyrating = user.sellerRating;
      }
      
      let prevRating = dummyrating;
    
      let newRating = (prevRating + updates.sellerRating)/2;

      updates.sellerRating = newRating;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true
    });
    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.protected = async (req, res, next) => {
  try {
    //1) Getting token and check of its there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'unauthorized access',
      });
    }
    //Verification of a token
    const wrongToken = jwt.decode(token);
    if (!wrongToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'unauthorized access',
      });
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_TOKEN);
    if (!decoded.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'unauthorized access',
      });
    }
    const currentUser = await User.findById(decoded.id);
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return res.status(403).json({
        status: 'fail',
        message: "You don't have a permission to perform this action",
      });
    }
    next();
  };
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'There is no user of this email',
      });
    }
    const resetToken = await user.createResetPasswordToken();
    await user.save();

    const message = `Forget your password? Submit a patch request with your new password and password Confirm to ${resetToken}.\n If you don't forget your password then ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (Valid for 10 mints)',
        message,
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({
        status: 'fail',
        message: 'Error in sending an email. Try again later!',
        error: err,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.pinCodeCompare = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findOne({
      passwordResetToken: pin,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      res.status(400).json({
        status: 'fail',
        message: 'invalid Pin or pin expired',
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Pin is valid',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { pin } = req.params;
    const { password, confirmPassword } = req.body;
    if (!confirmPassword) {
      res.status(400).json({
        status: 'fail',
        message: 'Please give the confirm password',
      });
    }
    const user = await User.findOne({
      passwordResetToken: pin,
      passwordResetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'invalid Pin or pin expired',
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords are not match with each other',
      });
    }
    user.password = password;
    user.confirmPassword = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'Password Changed Successfully!',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    console.log('user', user);
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    const correctPass = await user.correctPassword(req.body.previousPassword, user.password);
    if (!correctPass) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid exisiting password',
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password and confrim password are not matched',
      });
    }
    user.password = req.body.password;
    user.confirmPassword = undefined;
    user.previousPassword = undefined;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'Password Changed Successfully!',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updatePrivacteStatus = async (req, res) => {
  try {
    let {userId, status} = req.body;
    console.log(userId, status);
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      res.status(400).json({
        status: 'fail',
        message: 'user does not exist',
      });
    }
    
    let updatedUser = await User.findOneAndUpdate(userId, { privateStatus: status });
    console.log(updatedUser);

    res.send(200).json({
      status: 'successful',
      message: 'User Updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      status: 'successful',
      length: users.length,
      data: users,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'User id is required',
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({
        status: 'successful',
        message: 'User does not exist',
      });
    }
    return res.status(200).json({
      status: 'successful',
      user: user,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'User id is required',
      });
    }
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(200).json({
        status: 'successful',
        message: 'User does not exist',
      });
    }
    return res.status(200).json({
      status: 'successful',
      user: user,
    });

  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}
