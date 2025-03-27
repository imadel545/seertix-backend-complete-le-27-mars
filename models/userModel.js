const { pool } = require("../config/db");

const UserModel = {
  /**
   * Crée un nouvel utilisateur.
   * @param {string} name - Nom de l'utilisateur.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} hashedPassword - Mot de passe haché.
   * @returns {object} - L'utilisateur créé.
   */
  async create(name, email, hashedPassword) {
    try {
      const result = await pool.query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email`,
        [name.trim(), email.toLowerCase(), hashedPassword]
      );
      return result.rows[0];
    } catch (err) {
      console.error(
        "❌ Erreur lors de la création de l'utilisateur :",
        err.message
      );
      throw new Error("Erreur lors de la création de l'utilisateur.");
    }
  },

  /**
   * Recherche un utilisateur par email.
   * @param {string} email - Email à rechercher.
   * @returns {object|null} - L'utilisateur ou null.
   */
  async findByEmail(email) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
        email.toLowerCase(),
      ]);
      return result.rows[0] || null;
    } catch (err) {
      console.error("❌ Erreur findByEmail :", err.message);
      throw new Error("Erreur lors de la recherche par email.");
    }
  },

  /**
   * Recherche un utilisateur par ID.
   * @param {string} id - UUID de l'utilisateur.
   * @returns {object|null} - L'utilisateur ou null.
   */
  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, name, email, bio, pays, photo, created_at 
         FROM users WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error("❌ Erreur findById :", err.message);
      throw new Error("Erreur lors de la recherche par ID.");
    }
  },

  /**
   * Met à jour les informations d'un utilisateur.
   * @param {string} id - UUID utilisateur.
   * @param {object} fields - Champs à mettre à jour.
   * @returns {object|null} - Utilisateur mis à jour.
   */
  async updateProfile(id, fields) {
    const allowedFields = ["name", "bio", "photo", "pays"];
    const updates = [];
    const values = [];
    let index = 1;

    for (const key of allowedFields) {
      if (fields[key]) {
        updates.push(`${key} = $${index++}`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);

    const query = `
      UPDATE users SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING id, name, email, bio, pays, photo, created_at
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (err) {
      console.error("❌ Erreur updateProfile :", err.message);
      throw new Error("Erreur lors de la mise à jour du profil.");
    }
  },

  /**
   * Récupère les infos publiques d'un utilisateur (profil public).
   * @param {string} id - UUID utilisateur.
   * @returns {object|null}
   */
  async getPublicProfile(id) {
    try {
      const result = await pool.query(
        `SELECT id, name, bio, photo, pays, created_at
         FROM users WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error("❌ Erreur getPublicProfile :", err.message);
      throw new Error("Erreur lors de la récupération du profil public.");
    }
  },
};

module.exports = UserModel;
