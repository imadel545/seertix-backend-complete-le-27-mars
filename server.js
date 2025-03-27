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
require("express-async-errors"); // ✅ Gestion des erreurs async

// 🔁 Routes
const authRoutes = require("./routes/authRoutes");
const adviceRoutes = require("./routes/adviceRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");

// 🔌 Socket.io
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./sockets");

const app = express();
const port = process.env.PORT || 5050;

// ✅ Serveur HTTP + WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.set("io", io);
socketHandler(io);

// 🔒 Vérifie les variables d'environnement
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL manquante dans .env !");
  process.exit(1);
}

// 🔐 Sécurité HTTP de base
app.use(helmet());

// ✅ Gestion du CORS (accès frontend)
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

// ✅ Parse JSON + gestion des erreurs JSON
app.use(express.json(), (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "❌ JSON mal formé." });
  }
  next();
});

// 📦 Compression & Logs
app.use(compression());
app.use(morgan("dev")); // "combined" si tu veux plus de détails

// 🔐 Limite les tentatives brutales (DDOS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requêtes / fenêtre
  message: { error: "⏳ Trop de requêtes, réessayez plus tard." },
});
app.use("/auth", limiter);

// ✅ Routes principales
app.use("/auth", authRoutes);
app.use("/advice", adviceRoutes);
app.use("/comment", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/user", userRoutes);

// 🔍 Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Route racine (optionnelle)
app.get("/", (req, res) => {
  res.send("✅ API Seertix en ligne !");
});

// 🛑 404 : route inconnue
app.use((req, res) => {
  res.status(404).json({ error: "❌ Ressource non trouvée." });
});

// 🧨 Gestion globale des erreurs serveur
app.use((err, req, res, next) => {
  console.error("🔥 Erreur interne :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// ✅ Connexion DB + lancement serveur
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log("\n✅ PostgreSQL connecté avec succès.");
      console.log(`🚀 Serveur en ligne : http://localhost:${port}`);
      console.log(`📄 Swagger dispo : http://localhost:${port}/api-docs\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Échec connexion DB :", err);
    process.exit(1);
  });
