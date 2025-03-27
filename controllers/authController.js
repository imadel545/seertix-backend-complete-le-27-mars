// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// ✅ INSCRIPTION + Connexion automatique
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const client = await pool.connect();

    const { rows: existing } = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) {
      client.release();
      return res.status(400).json({ error: "L'email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: newUserRows } = await client.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at`,
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    const newUser = newUserRows[0];
    const token = generateToken(newUser.id);

    client.release();

    return res.status(201).json({
      message: "Inscription réussie. Vous êtes maintenant connecté.",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Erreur d'inscription :", error.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ CONNEXION
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      client.release();
      return res.status(400).json({ error: "Identifiants incorrects." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      client.release();
      return res.status(400).json({ error: "Identifiants incorrects." });
    }

    const token = generateToken(user.id);

    client.release();

    return res.json({
      message: "Connexion réussie.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        photo: user.photo,
        bio: user.bio,
        pays: user.pays,
      },
    });
  } catch (error) {
    console.error("❌ Erreur de connexion :", error.message);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// ✅ PROFIL (protégé par middleware JWT)
exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, created_at, bio, photo, pays 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération du profil :",
      error.message
    );
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
