const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser, checkPermission } = require('../utils');

//-password remve the passwords
//get all user is only for admin
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  //problem:getting the request from the single user for example if the user is s:user or y:admin it has seperate id we get the seperate id from that ,the problem is we can access/ get the details of the single user by therir id in the getsingle user route i.e any user can view other user details.

  //sol: But the condition is  only the admin should see the other user details and also if the current user can see his details

  const user = await User.find({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`no data with that id ${req.params.id}`);
  }
  //find will give the first occurance
  console.log('>>>>>>>', user[0]._id);
  //check for admin, user===user(current user)
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
  //updating the property
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

//f-1--> showing the current user
//f2-->update password,conmpare passord
//findOneandUpdate
/*
const user = await User.findOneAndUpdate(
  {_id:req.user.userId}//userId from create token
  {email,name}//update the email and name as ohter field has seperate routes,
  {new: true, runValidators:true}

  after updating createtoken user and attach the token with the cookies with res
 const tokenuser = createTokenuser(user)
 attachcookies(res,user:tokenuser)

 send the tokenuser as response
 res.status(200).json({user:tokenUser
})

)
*/
