// Custom middleware #1: request logger.
// It prints the method, URL, status code and time taken for every request.
const logger = (req, res, next) => {
  const start = Date.now();

  // 'finish' fires after the response has been sent, so the status code is known
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next(); // pass control to the next middleware
};

module.exports = logger;