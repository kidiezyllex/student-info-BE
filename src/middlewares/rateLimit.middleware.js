import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    status: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    errors: {
      rateLimit: 'Authentication rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Skip failed requests that don't count against the limit
  skipFailedRequests: false,
  // Handler for when rate limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      errors: {
        rateLimit: 'Authentication rate limit exceeded'
      },
      data: {},
      timestamp: new Date()
    });
  }
});

/**
 * General rate limiting middleware for all API endpoints
 * More lenient for general API usage
 */
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    status: false,
    message: 'Too many requests. Please try again later.',
    errors: {
      rateLimit: 'API rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count successful requests against the limit as heavily
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many requests. Please try again later.',
      errors: {
        rateLimit: 'API rate limit exceeded'
      },
      data: {},
      timestamp: new Date()
    });
  }
});

/**
 * Strict rate limiting for sensitive endpoints
 * Very restrictive for critical operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    status: false,
    message: 'Too many requests for this sensitive operation. Please try again in 1 hour.',
    errors: {
      rateLimit: 'Strict rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many requests for this sensitive operation. Please try again in 1 hour.',
      errors: {
        rateLimit: 'Strict rate limit exceeded'
      },
      data: {},
      timestamp: new Date()
    });
  }
}); 