const jwt = require('jsonwebtoken');
const User = require('./auth.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract & check authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify and decode JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findById(payload.id).select('first_name last_name email');
    if (!user) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    req.user = user;

    return next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Optional auth (won't block if no/invalid token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(payload.id).select("first_name last_name email");
        if (user) {
          req.user = user;
        }
      } catch (err) {
        req.user = null;
      }
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = { 
  authMiddleware,
  optionalAuth
}