const logger = require('../config/logger');

exports.getHealth = (req, res) => {
  logger.info('Health check requested', {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ message: 'Server is running!' });
};


