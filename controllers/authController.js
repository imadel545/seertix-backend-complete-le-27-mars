const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/**
 * Inscription d'un utilisateur.
 * Valide les champs requis, vérifie l'unicité de l'email,
 * hash le mot de passe et insère le nouvel utilisateur dans la base.
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const client = await pool.connect();

    // Vérification si l'email est déjà utilisé
    const userExists = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      client.release();
      return res.status(400).json({ error: "L'email est déjà utilisé" });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion du nouvel utilisateur
    const newUserResult = await client.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    client.release();

    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      user: newUserResult.rows[0],
    });
  } catch (error) {
    console.error("❌ Erreur d'inscription:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/**
 * Connexion d'un utilisateur.
 * Vérifie les identifiants, compare le mot de passe, et génère un token JWT
 * avec le payload { userId: user.id }.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ error: "Identifiants incorrects" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      client.release();
      return res.status(400).json({ error: "Identifiants incorrects" });
    }

    client.release();

    // Générer un token JWT valide pour 1 heure
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/**
 * Récupère le profil de l'utilisateur connecté.
 * Utilise l'ID stocké dans le token JWT (userId) pour récupérer les données.
 */
exports.getProfile = async (req, res) => {
  // On utilise req.user.userId, car le token est généré avec { userId: user.id }
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération du profil:",
      error.message
    );
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
