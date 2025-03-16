const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h";

const authService = {
  async registerUser(name, email, password) {
    if (!name || !email || !password) {
      throw new Error("Tous les champs sont requis.");
    }

    try {
      const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userExists.rows.length > 0) {
        throw new Error("Email déjà utilisé.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );

      return result.rows[0];
    } catch (error) {
      console.error("❌ Erreur lors de l’inscription :", error);
      throw new Error("Erreur lors de l’inscription.");
    }
  },

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error("Email et mot de passe sont requis.");
    }

    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        throw new Error("Identifiants incorrects.");
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Identifiants incorrects.");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
      return { token, user: { id: user.id, name: user.name, email: user.email } };
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error);
      throw new Error("Erreur lors de la connexion.");
    }
  },

  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du token :", error);
      throw new Error("Token invalide ou expiré.");
    }
  },
};

module.exports = authService;
