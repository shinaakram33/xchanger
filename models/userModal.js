const mongoose = require('mongoose');
const validator = require('validator');
const bycript = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    // validate: [validator.isAlpha, 'Name only accept alphabets'],
    validate: {
      validator: function (el) {
        return new RegExp(/^[a-zA-Z ]*$/).test(this.name);
      },
      message: 'Name only accept alphabets',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be of 8 or more characters'],
    // select: false,
  },
  confirmPassword: {
    type: String,
    minlength: [8, 'Password is not less than 8 characters'],
    select: false,
    validate: {
      //This will only work on CREATE OR SAVE Mongoose query
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  roles: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  connAccount: {
    id: {
      type: String
    },
    flag: {
      type: Boolean,
      default: false,
    }
  },
  gender: {
    type: String,
    default: null,
  },
  privateStatus: {
    type: Boolean,
    defalt: false
  },
  image: {
    type: String,
    default: null,
  },
  date_of_birth: {
    type: Date,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  sellerRating: {
    type: Number,
    default: 0
  },
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  previousPassword: { type: String, default: undefined },
},{ timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycript.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bycript.compare(candidatePassword, userPassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetToken = resetToken;
  // this.passwordResetToken = await bycript.hash(resetToken, 12);
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
