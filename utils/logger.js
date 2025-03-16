// utils/logger.js

/**
 * Logger minimal pour la journalisation dans l'application.
 * Remplacez-le par un logger plus sophistiqué (ex. Winston, Pino) si nécessaire.
 */

module.exports = {
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};
