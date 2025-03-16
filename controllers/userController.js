const pool = require("../config/db");

exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(
      "❌ Erreur lors de la récupération du profil utilisateur :",
      err.message
    );
    res.status(500).json({
      error: "Erreur interne du serveur, veuillez réessayer plus tard",
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username et email sont requis" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email",
      [username, email, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(
      "❌ Erreur lors de la mise à jour du profil utilisateur :",
      err.message
    );
    res.status(500).json({
      error: "Erreur interne du serveur, veuillez réessayer plus tard",
    });
  }
};
