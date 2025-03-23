require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./config/swagger.json");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adviceRoutes = require("./routes/adviceRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Importation pour la gestion des erreurs async
require("express-async-errors");

// Intégration de Socket.io
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./sockets");

const app = express();
const port = process.env.PORT || 5050;

// Création du serveur HTTP et instance Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);
socketHandler(io);

// Vérification des variables d'environnement essentielles
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL non défini. Vérifiez votre fichier .env.");
  process.exit(1);
}

// Sécurisation des en-têtes HTTP
app.use(helmet());

// Configuration du CORS avec liste blanche
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS non autorisé."));
      }
    },
    methods: "GET,POST,PUT,DELETE",
  })
);

// Gestion des erreurs JSON mal formées
app.use(express.json(), (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "❌ Requête JSON invalide." });
  }
  next();
});

// Compression des réponses HTTP
app.use(compression());

// Journalisation avancée des requêtes HTTP
app.use(morgan("combined"));

// Limitation du nombre de requêtes pour prévenir les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "⏳ Trop de requêtes. Réessayez plus tard." },
});
app.use("/auth", limiter);

// Configuration des routes principales
app.use("/auth", authRoutes);
app.use("/advice", adviceRoutes);
app.use("/comment", commentRoutes);
app.use("/notifications", notificationRoutes);

// Documentation de l'API avec Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Gestion des routes non définies
app.use((req, res) => {
  res.status(404).json({ error: "❌ Ressource non trouvée." });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("❌ Erreur interne :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Serveur en ligne sur http://localhost:${port}`);
      console.log(
        `📄 Documentation API disponible sur http://localhost:${port}/api-docs`
      );
    });
  })
  .catch((err) => {
    console.error("❌ Échec de la connexion à la base de données :", err);
    process.exit(1);
  });
