const { Pool } = require("pg");

// Création de la connexion à PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false, // Active le SSL uniquement en production
});

const connectDB = async () => {
  try {
    // Essaie de se connecter à la base de données
    await pool.connect();
    console.log("✅ PostgreSQL connecté avec succès.");
  } catch (err) {
    console.error("❌ Erreur de connexion à la base de données:", err.message);
    // Quitter le processus en cas d'échec de la connexion à la DB
    process.exit(1);
  }
};

// Assurer la fermeture propre de la connexion à la base de données à la fin de l'application
const disconnectDB = async () => {
  try {
    await pool.end();
    console.log("✅ Connexion PostgreSQL fermée.");
  } catch (err) {
    console.error("❌ Erreur lors de la fermeture de la connexion à la DB:", err.message);
  }
};

module.exports = { pool, connectDB, disconnectDB };
