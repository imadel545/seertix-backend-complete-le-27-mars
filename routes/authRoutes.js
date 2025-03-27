const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Validation pour l'inscription
const validateRegisterFields = [
  body("name").notEmpty().withMessage("Le nom est requis."),
  body("email").isEmail().withMessage("Email invalide."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mot de passe min. 6 caractères."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// ✅ Validation pour la connexion
const validateLoginFields = [
  body("email").isEmail().withMessage("Email invalide."),
  body("password").notEmpty().withMessage("Mot de passe requis."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// ✅ Routes
router.post("/register", validateRegisterFields, register);
router.post("/login", validateLoginFields, login);
router.get("/profile", authenticateToken, getProfile);
router.get("/protected-route", authenticateToken, (req, res) =>
  res.json({ message: "✅ Accès à une route protégée." })
);

module.exports = router;
