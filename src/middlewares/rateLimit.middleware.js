import rateLimit from 'express-rate-limit';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    errors: {
      rateLimit: 'Authentication rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
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

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
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
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
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

export const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    return `${req.ip}-${req.body.email || 'no-email'}`;
  },
  message: {
    success: false,
    message: 'Too many email verification requests. Please try again in 15 minutes.',
    errors: {
      rateLimit: 'Email rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many email verification requests. Please try again in 15 minutes.',
      errors: {
        rateLimit: 'Email rate limit exceeded'
      },
      data: {},
      timestamp: new Date()
    });
  }
});

export const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return `${req.ip}-${req.body.email || 'no-email'}`;
  },
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again in 15 minutes.',
    errors: {
      rateLimit: 'Verification rate limit exceeded'
    },
    data: {},
    timestamp: new Date()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many verification attempts. Please try again in 15 minutes.',
      errors: {
        rateLimit: 'Verification rate limit exceeded'
      },
      data: {},
      timestamp: new Date()
    });
  }
}); 