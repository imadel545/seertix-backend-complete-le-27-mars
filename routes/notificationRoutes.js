// routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const { authenticateToken } = require("../middlewares/authMiddleware"); // ✅ destructuration ici

// Récupérer les notifications de l'utilisateur connecté
router.get("/", authenticateToken, getNotifications);

// Marquer une notification comme lue
router.put("/:id/read", authenticateToken, markNotificationAsRead);

module.exports = router;
