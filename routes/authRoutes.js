const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Middleware pour valider les champs d'inscription
const validateRegisterFields = [
  body("name").notEmpty().withMessage("Le nom est requis."),
  body("email").isEmail().withMessage("Veuillez fournir un email valide."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware pour valider les champs de connexion
const validateLoginFields = [
  body("email").isEmail().withMessage("Veuillez fournir un email valide."),
  body("password").notEmpty().withMessage("Le mot de passe est requis."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Routes d'authentification
router.post("/register", validateRegisterFields, register);
router.post("/login", validateLoginFields, login);
router.get("/profile", authenticateToken, getProfile);

// Route protégée d'exemple
router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "Vous avez accédé à une route protégée." });
});

module.exports = router;
