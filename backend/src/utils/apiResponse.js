// Standard API Response Formatter

export const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (res, message = 'Internal Server Error', code = 'SERVER_ERROR', statusCode = 500, details = null) => {
  const errorObj = {
    code,
    message,
  };

  if (details && process.env.NODE_ENV === 'development') {
    errorObj.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
};
