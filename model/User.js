// // const { string } = require('joi');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'please provide email'],
    // match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'please provide required email'],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please Provide Valid Email' //alternative for match and require
    }
  },
  password: {
    type: String,
    required: [true, 'please provide password'],
    minlength: 3
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});

//hasing before saving to DB
UserSchema.pre('save', async function () {
  // console.log('>>>>>>>>>>updated');
  if (!this.isModified('password')) return; //#f1#f3
  const salt = await bcrypt.genSalt(10);
  //storing the hashed password in the key password of usermodel
  this.password = await bcrypt.hash(this.password, salt);
});

//comparing the loggedin password and hashed password
UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatch = await bcrypt.compare(userpassword, this.password);
  return isMatch;
};
module.exports = mongoose.model('User', UserSchema);

//f1- if we are not modyfing the path of the password return the password which is previously salted  hashed value and if we are  modifying the the path of the password return the new password with salted value.

//in update method if used this then we must provoke the pre fn in db
/*f3--> const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();invoke the model*/

//in update method if we used this we must not need to provoke the pre save fn in user model
/* const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name }, { new: true, runValidators: true }); //--id,property,accept new and validation
  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};*/
