const CustomAPIError = require('./custom-api');
const { StatusCodes } = require('http-status-codes');

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
