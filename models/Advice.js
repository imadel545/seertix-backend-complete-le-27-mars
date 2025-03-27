const { pool } = require("../config/db");
const crypto = require("crypto");

class AdviceModel {
  constructor() {
    this.initializeTable();
  }

  async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS advices (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_advice_id INT REFERENCES advices(id) ON DELETE CASCADE,
        hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log("✅ Table advices initialisée avec succès.");
    } catch (err) {
      console.error("❌ Erreur init table advices :", err.message);
    }
  }

  static generateHash(content) {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  async create(content, author_id, parent_advice_id = null) {
    const hash = AdviceModel.generateHash(content);

    const query = `
      INSERT INTO advices (content, author_id, parent_advice_id, hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [content, author_id, parent_advice_id, hash];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getAll() {
    const query = `
      SELECT a.id, a.content, a.created_at, a.parent_advice_id, u.name AS owner_name
      FROM advices a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = `
      SELECT a.id, a.content, a.created_at, a.author_id,
             u.name AS author_name, u.email AS author_email, u.created_at AS author_created_at
      FROM advices a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getUserAdviceCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) AS count FROM advices WHERE author_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0]?.count || "0", 10);
  }

  async getRandomAdvice(excludeUserId) {
    const result = await pool.query(
      `SELECT a.id, a.content, a.created_at, u.name AS owner_name
       FROM advices a
       JOIN users u ON a.author_id = u.id
       WHERE a.author_id != $1
       ORDER BY RANDOM()
       LIMIT 1`,
      [excludeUserId]
    );
    return result.rows[0] || null;
  }

  async update(id, userId, content) {
    const result = await pool.query(
      `UPDATE advices SET content = $1
       WHERE id = $2 AND author_id = $3
       RETURNING *`,
      [content.trim(), id, userId]
    );
    return result.rows[0] || null;
  }

  async delete(id, userId) {
    const check = await pool.query(
      `SELECT id FROM advices WHERE id = $1 AND author_id = $2`,
      [id, userId]
    );
    if (check.rows.length === 0) return null;

    await pool.query(`DELETE FROM advices WHERE id = $1`, [id]);
    return { message: "✅ Conseil supprimé." };
  }
}

module.exports = new AdviceModel();
