const { pool } = require("../config/db");
const crypto = require("crypto");

/**
 * Génère un hash MD5 pour un contenu donné.
 * @param {string} content
 * @returns {string}
 */
const generateHash = (content) =>
  crypto.createHash("md5").update(content).digest("hex");

/**
 * Récupérer tous les conseils avec les informations du propriétaire.
 * GET /advice
 */
exports.getAllAdvice = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.content, a.created_at, a.parent_advice_id, u.name AS owner_name
       FROM advices a
       JOIN users u ON a.author_id = u.id
       ORDER BY a.created_at DESC`
    );
    return res.json(rows);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des conseils :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Répondre à un conseil existant.
 * POST /advice/:id/reply
 */
exports.replyToAdvice = async (req, res) => {
  const { content } = req.body;
  const parentAdviceId = parseInt(req.params.id, 10);
  const userId = req.user.userId;

  if (!content || content.trim().length < 3 || content.trim().length > 300) {
    return res.status(400).json({
      error: "Le contenu de la réponse doit être entre 3 et 300 caractères.",
    });
  }

  try {
    // Vérifie que le conseil parent existe
    const { rows: parentRows } = await pool.query(
      "SELECT id FROM advices WHERE id = $1",
      [parentAdviceId]
    );
    if (parentRows.length === 0) {
      return res.status(404).json({ error: "Le conseil parent n'existe pas." });
    }

    // Insère la réponse
    const { rows } = await pool.query(
      "INSERT INTO advices (content, author_id, parent_advice_id, hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [content.trim(), userId, parentAdviceId, generateHash(content)]
    );

    return res.status(201).json({
      message: "Réponse ajoutée avec succès.",
      advice: rows[0],
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la réponse :", error.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Soumettre un conseil et récupérer immédiatement un conseil aléatoire d’un autre utilisateur.
 * POST /advice
 */
exports.submitAdviceAndGetRandom = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length < 3 || content.trim().length > 300) {
    return res.status(400).json({
      error: "Le contenu du conseil doit être entre 3 et 300 caractères.",
    });
  }

  try {
    const { rows: insertedRows } = await pool.query(
      "INSERT INTO advices (content, author_id, hash) VALUES ($1, $2, $3) RETURNING *",
      [content.trim(), userId, generateHash(content)]
    );
    const newAdvice = insertedRows[0];

    const { rows: randomRows } = await pool.query(
      `SELECT a.id, a.content, a.created_at, u.name AS owner_name
       FROM advices a
       JOIN users u ON a.author_id = u.id
       WHERE a.author_id != $1
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (randomRows.length === 0) {
      return res.status(200).json({
        message:
          "Conseil soumis, mais aucun conseil aléatoire disponible pour le moment.",
        newAdvice,
      });
    }

    const randomAdvice = randomRows[0];
    return res.status(201).json({
      message: "Conseil soumis avec succès et voici un conseil aléatoire.",
      newAdvice,
      randomAdvice,
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la soumission du conseil et récupération du conseil aléatoire :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Récupérer un conseil aléatoire soumis par un autre utilisateur.
 * GET /advice/random
 */
exports.getRandomAdvice = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) AS count FROM advices WHERE author_id = $1",
      [userId]
    );
    if (parseInt(countRows[0].count, 10) === 0) {
      return res.status(403).json({
        error:
          "❌ Vous devez soumettre un conseil avant d'en recevoir un autre.",
      });
    }

    const { rows: randomRows } = await pool.query(
      `SELECT a.id, a.content, a.created_at, u.name AS owner_name
       FROM advices a
       JOIN users u ON a.author_id = u.id
       WHERE a.author_id != $1
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (randomRows.length === 0) {
      return res.status(404).json({ error: "Aucun conseil disponible." });
    }

    return res.json(randomRows[0]);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération d'un conseil :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Modifier un conseil (uniquement par l'auteur).
 * PUT /advice/:id
 */
exports.updateAdvice = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;
  const userId = req.user.userId;

  if (!content || content.trim().length < 3 || content.trim().length > 300) {
    return res.status(400).json({
      error: "Le contenu du conseil doit être entre 3 et 300 caractères.",
    });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM advices WHERE id = $1 AND author_id = $2",
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(403).json({
        error: "❌ Vous n'êtes pas autorisé à modifier ce conseil.",
      });
    }

    const { rows: updatedRows } = await pool.query(
      "UPDATE advices SET content = $1 WHERE id = $2 RETURNING *",
      [content.trim(), id]
    );
    return res.json({
      message: "✅ Conseil mis à jour avec succès.",
      advice: updatedRows[0],
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour du conseil :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Supprimer un conseil (uniquement par l'auteur).
 * DELETE /advice/:id
 */
exports.deleteAdvice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM advices WHERE id = $1 AND author_id = $2",
      [id, userId]
    );
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ error: "❌ Vous n'êtes pas autorisé à supprimer ce conseil." });
    }

    await pool.query("DELETE FROM advices WHERE id = $1", [id]);
    return res.json({ message: "✅ Conseil supprimé avec succès." });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression du conseil :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

module.exports = {
  getAllAdvice: exports.getAllAdvice,
  submitAdviceAndGetRandom: exports.submitAdviceAndGetRandom,
  getRandomAdvice: exports.getRandomAdvice,
  replyToAdvice: exports.replyToAdvice,
  updateAdvice: exports.updateAdvice,
  deleteAdvice: exports.deleteAdvice,
};
