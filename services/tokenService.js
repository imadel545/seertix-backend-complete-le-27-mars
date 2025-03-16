// services/tokenService.js

/**
 * Fonction pour vérifier si un token a été révoqué.
 * Pour l'instant, cette implémentation retourne toujours false,
 * ce qui signifie que les tokens ne sont jamais révoqués.
 * Vous pourrez étendre cette fonction ultérieurement si besoin.
 *
 * @param {string} token - Le token JWT à vérifier.
 * @returns {Promise<boolean>} - Promise résolue à false.
 */
async function isTokenRevoked(token) {
  return false;
}

module.exports = { isTokenRevoked };
