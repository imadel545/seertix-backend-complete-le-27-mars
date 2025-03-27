const pool = require("../config/db");

/**
 * 🔐 Récupérer le profil de l'utilisateur connecté
 * GET /user/profile
 */
exports.getUserProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { rows } = await pool.query(
      `SELECT id, name AS username, email, bio, photo, pays, role_id,
              to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération profil :", err.message);
    res.status(500).json({ error: "Erreur serveur. Réessayez plus tard." });
  }
};

/**
 * 🔐 Mettre à jour le profil de l'utilisateur connecté
 * PUT /user/profile
 */
exports.updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { username, email, bio, photo, pays } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Nom et email sont requis." });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, bio = $3, photo = $4, pays = $5
       WHERE id = $6
       RETURNING id, name AS username, email, bio, photo, pays,
                 to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at`,
      [username, email, bio || "", photo || "", pays || "", userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(200).json({
      message: "✅ Profil mis à jour avec succès.",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour profil :", err.message);
    res.status(500).json({ error: "Erreur serveur. Réessayez plus tard." });
  }
};

/**
 * 🔓 Voir le profil public d’un utilisateur
 * GET /user/:id
 */
exports.getUserPublicProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name AS username, u.bio, u.photo, u.pays,
              to_char(u.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
              (
                SELECT COUNT(*) FROM advices WHERE author_id = u.id
              ) AS conseils_count
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profil utilisateur introuvable." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération profil public :", err.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
