const { pool } = require("../config/db");

const Comment = {
  // Ajouter un commentaire
  async create(content, adviceId, userId, parentCommentId = null) {
    const query = `
      INSERT INTO comments (content, advice_id, user_id, parent_comment_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [content, adviceId, userId, parentCommentId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Récupérer tous les commentaires d'une publication avec nombre de likes
  async findByAdviceId(adviceId) {
    const query = `
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id, 
        u.name AS user_name, 
        c.parent_comment_id,
        COUNT(cl.comment_id) AS likes
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.advice_id = $1
      GROUP BY c.id, u.name
      ORDER BY c.created_at ASC;
    `;
    const { rows } = await pool.query(query, [adviceId]);
    return rows;
  },

  // Récupérer un commentaire spécifique
  async findById(commentId) {
    const query = `
      SELECT * FROM comments WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return rows[0];
  },

  // Mettre à jour un commentaire
  async update(commentId, userId, newContent) {
    const query = `
      UPDATE comments
      SET content = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    const values = [newContent, commentId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Supprimer un commentaire
  async delete(commentId, userId) {
    const query = `
      DELETE FROM comments
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const values = [commentId, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};

module.exports = Comment;
