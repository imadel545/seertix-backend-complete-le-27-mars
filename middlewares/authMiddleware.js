const jwt = require("jsonwebtoken");
const logger = require("../utils/logger"); // Import complet du logger
const { isTokenRevoked } = require("../services/tokenService");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.warn("No authorization header provided");
    return res
      .status(401)
      .json({ error: "Access denied, no authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    logger.warn("Invalid token format");
    return res
      .status(401)
      .json({ error: "Access denied, invalid token format" });
  }

  // Vérifier si le token a été révoqué
  if (await isTokenRevoked(token)) {
    logger.warn("Token is revoked");
    return res.status(403).json({ error: "Invalid or revoked token" });
  }

  // Vérification du token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error("Token verification failed", { error: err });
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Attacher le payload décodé à la requête
    req.user = user;
    logger.info("User authenticated", { userId: user.userId });
    next();
  });
};

module.exports = authenticateToken;
