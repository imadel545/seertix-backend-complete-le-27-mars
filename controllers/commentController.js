// controllers/commentController.js
const commentService = require("../services/commentService");

/**
 * Récupérer tous les commentaires d’un conseil.
 * GET /comments/:adviceId
 */
exports.getCommentsByAdviceId = async (req, res) => {
  const { adviceId } = req.params;
  const userId = req.user.userId;

  try {
    const comments = await commentService.getCommentsByAdviceId(
      adviceId,
      userId
    );
    res.json(comments);
  } catch (err) {
    console.error("❌ Erreur récupération commentaires :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Ajouter un commentaire ou une réponse.
 * POST /comments
 */
exports.addComment = async (req, res) => {
  const { content, adviceId, parentCommentId } = req.body;
  const userId = req.user.userId;
  const io = req.app.get("io");

  try {
    const newComment = await commentService.addComment(
      content,
      adviceId,
      userId,
      parentCommentId
    );
    io.to(`advice_${adviceId}`).emit("comment:new", newComment);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("❌ Erreur ajout commentaire :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Modifier un commentaire.
 * PUT /comments/:id
 */
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;
  const io = req.app.get("io");

  try {
    const updatedComment = await commentService.updateComment(
      id,
      userId,
      content
    );
    if (!updatedComment) {
      return res.status(403).json({ error: "Modification non autorisée." });
    }

    io.to(`advice_${updatedComment.advice_id}`).emit(
      "comment:update",
      updatedComment
    );
    res.json(updatedComment);
  } catch (err) {
    console.error("❌ Erreur update commentaire :", err.message);
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
  const io = req.app.get("io");

  try {
    const deletedComment = await commentService.deleteComment(id, userId);
    if (!deletedComment) {
      return res.status(403).json({ error: "Suppression non autorisée." });
    }

    io.to(`advice_${deletedComment.advice_id}`).emit("comment:delete", {
      commentId: deletedComment.id,
    });
    res.json({ message: "Commentaire supprimé avec succès." });
  } catch (err) {
    console.error("❌ Erreur suppression commentaire :", err.message);
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
    const result = await commentService.likeComment(id, userId);
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Erreur like commentaire :", err.message);
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
    const result = await commentService.unlikeComment(id, userId);
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Erreur unlike commentaire :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Nombre de likes.
 * GET /comments/:id/likes
 */
exports.getCommentLikes = async (req, res) => {
  const { id } = req.params;

  try {
    const likes = await commentService.getCommentLikes(id);
    res.json({ likes });
  } catch (err) {
    console.error("❌ Erreur récupération likes :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
