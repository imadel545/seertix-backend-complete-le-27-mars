const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { isTokenRevoked } = require("../services/tokenService");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Fonction utilitaire pour vérifier et décoder un token JWT.
 * @param {string} token
 * @returns {object|null} Payload utilisateur ou null si invalide.
 */
const verifyToken = async (token) => {
  try {
    if (!token || typeof token !== "string") return null;

    if (await isTokenRevoked(token)) {
      logger.warn("❌ Token révoqué");
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    logger.error("❌ Échec vérification JWT", { error: err.message });
    return null;
  }
};

/**
 * Middleware Express standard pour les routes HTTP.
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Accès refusé, token manquant" });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }

  req.user = user;
  next();
};

/**
 * Middleware Socket.io pour authentifier les connexions en temps réel.
 */
const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    logger.warn("🔐 Connexion socket sans token !");
    return next(new Error("Token requis pour la connexion socket"));
  }

  const user = await verifyToken(token);

  if (!user) {
    return next(new Error("Token invalide ou expiré"));
  }

  socket.user = user; // attaché à socket
  logger.info("🔐 Utilisateur connecté via Socket", { userId: user.userId });
  next();
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  verifyToken,
};
