const { pool } = require("../config/db");

/**
 * Récupérer tous les conseils.
 */
exports.getAllAdvice = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM advices ORDER BY created_at DESC"
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
 * Ajouter un conseil (limité à un par utilisateur).
 */
exports.addAdvice = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId; // Utilisation de userId extrait du token

  if (!content || content.length < 3 || content.length > 300) {
    return res.status(400).json({
      error: "Le contenu du conseil doit être entre 3 et 300 caractères.",
    });
  }

  try {
    // Vérifier si l'utilisateur a déjà soumis un conseil
    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) AS count FROM advices WHERE user_id = $1",
      [userId]
    );
    if (parseInt(countRows[0].count, 10) > 0) {
      return res.status(400).json({
        error:
          "❌ Vous avez déjà soumis un conseil. Vous ne pouvez pas en soumettre un autre.",
      });
    }

    // Ajouter le conseil
    const { rows } = await pool.query(
      "INSERT INTO advices (content, user_id) VALUES ($1, $2) RETURNING *",
      [content, userId]
    );
    return res.status(201).json({
      message: "✅ Conseil ajouté avec succès.",
      advice: rows[0],
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du conseil :", error.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Récupérer un conseil aléatoire soumis par un autre utilisateur.
 * L'utilisateur doit avoir déjà soumis un conseil pour pouvoir en recevoir un.
 */
exports.getRandomAdvice = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Vérifier que l'utilisateur a soumis au moins un conseil
    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*) AS count FROM advices WHERE user_id = $1",
      [userId]
    );
    if (parseInt(countRows[0].count, 10) === 0) {
      return res.status(403).json({
        error:
          "❌ Vous devez soumettre un conseil avant d'en recevoir un autre.",
      });
    }

    // Récupérer un conseil aléatoire d'un autre utilisateur
    const { rows } = await pool.query(
      "SELECT * FROM advices WHERE user_id != $1 ORDER BY RANDOM() LIMIT 1",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Aucun conseil disponible." });
    }
    return res.json(rows[0]);
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
 */
exports.updateAdvice = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;
  const userId = req.user.userId;

  if (!content || content.length < 3 || content.length > 300) {
    return res.status(400).json({
      error: "Le contenu du conseil doit être entre 3 et 300 caractères.",
    });
  }

  try {
    // Vérifier si le conseil existe et appartient à l'utilisateur
    const { rows } = await pool.query(
      "SELECT * FROM advices WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ error: "❌ Vous n'êtes pas autorisé à modifier ce conseil." });
    }

    // Mettre à jour le conseil
    const { rows: updatedRows } = await pool.query(
      "UPDATE advices SET content = $1 WHERE id = $2 RETURNING *",
      [content, id]
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
 */
exports.deleteAdvice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Vérifier que le conseil existe et appartient à l'utilisateur
    const { rows } = await pool.query(
      "SELECT * FROM advices WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ error: "❌ Vous n'êtes pas autorisé à supprimer ce conseil." });
    }

    // Supprimer le conseil
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
  addAdvice: exports.addAdvice,
  getRandomAdvice: exports.getRandomAdvice,
  updateAdvice: exports.updateAdvice,
  deleteAdvice: exports.deleteAdvice,
};
