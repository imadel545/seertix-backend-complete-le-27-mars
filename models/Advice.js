const pool = require("../config/db");
const crypto = require("crypto");

/**
 * Initialise la table des conseils si elle n'existe pas, et ajoute des colonnes manquantes si nécessaire.
 */
async function initializeAdviceTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS advices (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ Table advices initialisée avec succès.");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de la table advices :", err.message);
  }
}

initializeAdviceTable().catch(console.error);

/**
 * Génère un hash MD5 unique pour un contenu donné.
 * @param {string} content - Le contenu à hacher.
 * @returns {string} - Le hash MD5.
 */
function generateHash(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

const Advice = {
  /**
   * Crée un nouveau conseil.
   * @param {string} content - Le contenu du conseil.
   * @param {string} author_id - L'ID de l'auteur.
   * @returns {object} - Le conseil créé.
   */
  async create(content, author_id) {
    if (!content || content.length < 3 || content.length > 300) {
      throw new Error("❌ Le contenu doit être entre 3 et 300 caractères.");
    }

    const hash = generateHash(content);
    try {
      const result = await pool.query(
        "INSERT INTO advices (content, author_id, hash) VALUES ($1, $2, $3) RETURNING *",
        [content, author_id, hash]
      );
      return result.rows[0];
    } catch (err) {
      console.error("❌ Erreur lors de la création du conseil :", err.message);
      throw new Error("Erreur lors de la création du conseil.");
    }
  },

  // Ajout de documentation similaire pour chaque fonction...
  // Par exemple, `getAll()`, `getById()`, `getRandomAdvice()`, `update()`, et `delete()`.

};

module.exports = Advice;
