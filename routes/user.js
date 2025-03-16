const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// Route pour récupérer les informations de l'utilisateur
router.get("/profile", authenticateToken, userController.getUserProfile);

module.exports = router;
