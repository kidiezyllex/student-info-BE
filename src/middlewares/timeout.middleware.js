const timeoutMiddleware = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`Request timeout after ${timeoutMs}ms for ${req.method} ${req.path}`);
        res.status(408).json({
          success: false,
          message: 'Request timeout. Please try again.'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

export default timeoutMiddleware;
