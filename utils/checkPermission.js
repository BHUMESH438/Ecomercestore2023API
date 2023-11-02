const CustomError = require('../errors');
const checkPermission = (reqUser, resourceUserId) => {
  if (reqUser.role === 'admin') return;
  if (reqUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError('user not allowed to peek');
};
module.exports = checkPermission;
