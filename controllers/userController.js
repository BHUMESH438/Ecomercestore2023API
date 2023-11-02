const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser, checkPermission } = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.find({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`no data with that id ${req.params.id}`);
  }
  console.log('>>>>>>>', user[0]._id);
  checkPermission(req.user, user[0]._id);
  res.status(StatusCodes.OK).json({ user });
};
//f1
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

//---------------------------------------------
const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError('both fields is needed');
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

//----------------------------------------
const updateUserPassword = async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword) {
    throw new CustomError.BadRequestError('both fields is needed');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldpassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  user.password = newpassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'password updated' });
};

module.exports = { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword };

//f-1--> showing the current user,
//f2-->update password,conmpare passord
