const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

//authenticateUser--------------------------------------------------------------------
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  console.log(req.signedCookies.token);
  console.log(req.signedCookies);

  if (!token) {
    throw new CustomError.UnauthenticatedError('token is not present');
    console.log('>>>>>>>token not present');
  }
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
