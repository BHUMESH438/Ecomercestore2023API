const CustomError = require('../errors');
const checkPermission = (reqUser, resourceUserId) => {
  //if admin
  if (reqUser.role === 'admin') return;
  // if current user
  if (reqUser.userId === resourceUserId.toString()) return;
  //else
  throw new CustomError.UnauthorizedError('user not allowed to peek');
};
module.exports = checkPermission;
