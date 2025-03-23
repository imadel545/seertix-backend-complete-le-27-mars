const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middlewares/authMiddleware");

// Récupérer les notifications de l'utilisateur connecté
router.get("/", authenticateToken, notificationController.getNotifications);

// Marquer une notification comme lue
router.put(
  "/:id/read",
  authenticateToken,
  notificationController.markNotificationAsRead
);

module.exports = router;
