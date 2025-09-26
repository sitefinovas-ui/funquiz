// middlewares/logger.js
export const logger = (req, res, next) => {
  // Récupère l'IP du client
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${clientIp}`
  );

  next();
};
