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
  location: {
    latitude: { type: Number, required: true ,default:13.1271},
    longitude: { type: Number, required: true ,default:78.6569},
  },
});

const userModel = mongoose.model('UsersLogins', userSchema);
module.exports = userModel;