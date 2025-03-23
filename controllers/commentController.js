const Comment = require("../models/Comment");
const { pool } = require("../config/db");

/**
 * Récupérer tous les commentaires d’un conseil.
 * GET /comments/:adviceId
 */
exports.getCommentsByAdviceId = async (req, res) => {
  const { adviceId } = req.params;

  try {
    const comments = await Comment.findByAdviceId(adviceId);
    res.json(comments);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des commentaires :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Ajouter un nouveau commentaire ou une réponse.
 * POST /comments
 */
exports.addComment = async (req, res) => {
  const { content, adviceId, parentCommentId } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length < 1) {
    return res.status(400).json({ error: "Le contenu ne peut pas être vide." });
  }

  try {
    const newComment = await Comment.create(
      content,
      adviceId,
      userId,
      parentCommentId
    );
    res.status(201).json(newComment);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du commentaire :", error.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Mettre à jour un commentaire.
 * PUT /comments/:id
 */
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length < 1) {
    return res.status(400).json({ error: "Le contenu ne peut pas être vide." });
  }

  try {
    const updatedComment = await Comment.update(id, userId, content);
    if (!updatedComment) {
      return res
        .status(404)
        .json({ error: "Commentaire non trouvé ou non autorisé." });
    }
    res.json(updatedComment);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour du commentaire :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Supprimer un commentaire.
 * DELETE /comments/:id
 */
exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const deletedComment = await Comment.delete(id, userId);
    if (!deletedComment) {
      return res
        .status(404)
        .json({ error: "Commentaire non trouvé ou non autorisé." });
    }
    res.json({ message: "Commentaire supprimé avec succès." });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression du commentaire :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Liker un commentaire.
 * POST /comments/:id/like
 */
exports.likeComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, userId]
    );
    res.status(200).json({ message: "Commentaire liké." });
  } catch (error) {
    console.error("❌ Erreur lors du like du commentaire :", error.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Unliker un commentaire.
 * DELETE /comments/:id/unlike
 */
exports.unlikeComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      [id, userId]
    );
    res.status(200).json({ message: "Like retiré du commentaire." });
  } catch (error) {
    console.error("❌ Erreur lors du retrait du like :", error.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Récupérer le nombre de likes d’un commentaire.
 * GET /comments/:id/likes
 */
exports.getCommentLikes = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS likes FROM comment_likes WHERE comment_id = $1",
      [id]
    );
    res.json({ likes: parseInt(rows[0].likes, 10) });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des likes :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
