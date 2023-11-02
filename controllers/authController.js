const User = require('../model/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/index');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
require('../utils/createTokenUser');
//Register-----------------------------------------------------------------
const register = async (req, res) => {
  const { name, email, password } = req.body; //here also we add role and validate in schema

  //#f-1:check for duplicate doc
  const duplicateEmail = await User.findOne({ email });
  if (duplicateEmail) throw new CustomError.BadRequestError('email already exist');
  // //#f-2:1st created role should be admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';
  //#f-3:create user
  const user = await User.create({ name, email, password, role });
  // //#f-4:
  const tokenUser = createTokenUser(user);

  // attachCookiesToResponse({ res, user: tokenUser });
  // //if we didnot used the cookies then we must pass the token in the res
  res.status(StatusCodes.CREATED).json({ user });
};
//login-----------------------------------------------------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('both fields is needed');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('user email didnot exist');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

//#f-7 in browser we can see that in 5 sec the cookie will dissapear
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now())
  });
  res.status(StatusCodes.OK).json({ msg: 'ok logged out' });
};

module.exports = { register, login, logout };

//to verify duplicate email 1.schema validation (unique) 2.controller verification
//for logout in browser we can add 5sec but to test it in postman we can remove the 5 sec as the browser will refresh but not the postman and the browser will get the response 200 and after that 5sec it will remove the cookie

//#f-4:create token - include required feild and pass to token by obj method
// const tokenUser = { name: user.name, userId: user._id, role: user.role };
//res is an obj so we are pssing the obj directly as a parameter and by using obj notation in this fun re.cookies we add the cookies along with the res.

//#f-1:check for duplicate doc
