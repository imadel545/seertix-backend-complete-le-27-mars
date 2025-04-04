const sendErrorResponse = (res, statusCode, message) => {
  const statusMessages = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };

  res.status(statusCode).json({
    error: {
      code: statusCode,
      type: statusMessages[statusCode] || "Error",
      message,
    },
  });
};

module.exports = { sendErrorResponse };
