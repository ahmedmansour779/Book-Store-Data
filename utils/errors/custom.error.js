class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static create(statusCode, message) {
    return new CustomError(statusCode, message);
  }
}

export default CustomError;
