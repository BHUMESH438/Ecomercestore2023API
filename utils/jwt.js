const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
  console.log('payload>>>>>', payload);
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

//#f:6-attaching the res from the auth controller and getting the user credentails  from the token user
const attachCookiesToResponse = ({ res, user }) => {
  console.log('user>>>>>>', user);
  const token = createJWT({ payload: user });
  //#f5:cerate cookies type,token,expireand http only
  const oneDay = 1000 * 60 * 60 * 24; //ms*min*hr*day(total hr/day) in milliseconds
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production', //if env is production returts true or false(in dev)
    signed: true //if teh signed value is true then we must sign it in the app middleware
  });
};
module.exports = { createJWT, isTokenValid, attachCookiesToResponse };

//In the code you provided, you are passing the tokenUser object as the payload property when calling the createJWT function. The payload object contains the properties name, userId, and role from the tokenUser object.

//When you destructure the payload object in the createJWT function using { payload }, you are extracting the payload object itself. It's similar to writing const { payload } = payload;, but with object destructuring syntax.
