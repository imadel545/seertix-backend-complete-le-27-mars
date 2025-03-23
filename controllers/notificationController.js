const { pool } = require("../config/db");

/**
 * Récupérer les notifications pour l'utilisateur connecté.
 * GET /notifications
 */
exports.getNotifications = async (req, res) => {
  const userId = req.user.userId;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des notifications:",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

/**
 * Marquer une notification comme lue.
 * PUT /notifications/:id/read
 */
exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Notification non trouvée." });
    }
    res.json({
      message: "Notification marquée comme lue.",
      notification: rows[0],
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la notification:",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
