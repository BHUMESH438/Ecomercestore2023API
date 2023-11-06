const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

//authenticateUser401--------------------------------------------------------------------
const authenticateUser = async (req, res, next) => {
  //check for the signed token in cookies ,if we dont signed then its gonna be in the cookie req.cookie."token"- token is the key we passed while attaching the cookies to res
  const token = req.signedCookies.token;
  console.log('authenticateUser-token>>>>>>>', req.signedCookies.token); //we will get the signed cookies when we invoke the cookieparser
  console.log(req.signedCookies);

  if (!token) {
    console.log('>>>>>>>token not present');
    throw new CustomError.UnauthenticatedError('token is not present');
  }
  //unpacking the cookies to get the user data to product routes
  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role }; //htrhe e we send the user req in the middleware function so that we can access the usderid in the product document when we likend the document with the user
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('token is not present/invalid token');
    console.log('error>>>>>>>', error);
  }
};

//authenticateUserPermission-f-1--------------------------------------------------------
const authPermission = (...roles) => {
  //here roles will act as a rest operator and it will return an array from a function
  return (req, res, next) => {
    // 403
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError('Unauthorized access to this user');
    }
    next();
  };
};
module.exports = { authenticateUser, authPermission };

//if token not presenet it skips the 6th line
//if we didnt put next it wont go for the next route
//but if we looged in it will show that the token present and if we logged out it will show the token not present. but the catch here is req will not move forward to the next route.

//f-1 if the role we passed in the invoked callback function is not equal to the role of the logged in user then he cannot access the get-all user list
