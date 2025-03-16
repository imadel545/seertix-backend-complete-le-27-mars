const express = require("express");
const authRoutes = require("./authRoutes");
const adviceRoutes = require("./adviceRoutes");

const router = express.Router();

// Importation des routes d'authentification et des conseils
router.use("/auth", authRoutes);
router.use("/advice", adviceRoutes);

module.exports = router;
