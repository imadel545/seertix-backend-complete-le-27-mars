const pool = require("../config/db");

const UserModel = {
  /**
   * Crée un nouvel utilisateur.
   * @param {string} name - Nom de l'utilisateur.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @returns {object} - L'utilisateur créé.
   */
  async create(name, email, password) {
    try {
      const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, password]
      );
      return result.rows[0];
    } catch (err) {
      console.error("❌ Erreur lors de la création de l'utilisateur :", err.message);
      throw new Error("Erreur lors de la création de l'utilisateur.");
    }
  },

  // Ajout de documentation similaire pour `findUserByEmail` et `findUserById`.

};

module.exports = UserModel;
