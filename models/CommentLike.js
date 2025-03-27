// models/CommentLike.js
const { pool } = require("../config/db");

class CommentLikeModel {
  /**
   * Ajouter un like à un commentaire.
   * @param {number} commentId
   * @param {string} userId
   */
  async like(commentId, userId) {
    await pool.query(
      `INSERT INTO comment_likes (comment_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [commentId, userId]
    );
    return { message: "Commentaire liké." };
  }

  /**
   * Retirer un like d’un commentaire.
   * @param {number} commentId
   * @param {string} userId
   */
  async unlike(commentId, userId) {
    await pool.query(
      `DELETE FROM comment_likes
       WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );
    return { message: "Like retiré du commentaire." };
  }

  /**
   * Compter le nombre total de likes d’un commentaire.
   * @param {number} commentId
   */
  async countLikes(commentId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS likes
       FROM comment_likes
       WHERE comment_id = $1`,
      [commentId]
    );
    return parseInt(rows[0].likes, 10);
  }

  /**
   * Vérifie si un utilisateur a liké un commentaire.
   * @param {number} commentId
   * @param {string} userId
   * @returns {boolean}
   */
  async hasLiked(commentId, userId) {
    const { rows } = await pool.query(
      `SELECT 1 FROM comment_likes
       WHERE comment_id = $1 AND user_id = $2
       LIMIT 1`,
      [commentId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = new CommentLikeModel();
