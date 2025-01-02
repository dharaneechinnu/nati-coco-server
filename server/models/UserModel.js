const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileno: {
    type: String,
    required: true,
  },
  verified:{
    type:Boolean,
  },
  otpToken: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },
  resetPwdToken: {
    type: String,
    default: null,
  },
  resetPwdExpire: {
    type: Date,
    default: null,
  },
});

const userModel = mongoose.model('UsersLogins', userSchema);
module.exports = userModel;