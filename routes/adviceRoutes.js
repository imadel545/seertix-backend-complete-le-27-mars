// routes/adviceRoutes.js

const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getAllAdvice,
  submitAdviceAndGetRandom,
  getRandomAdvice,
  updateAdvice,
  deleteAdvice,
} = require("../controllers/adviceController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Middleware pour valider le contenu des conseils
const validateAdviceContent = [
  body("content")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Le contenu du conseil doit contenir au moins 5 caractères.")
    .isLength({ max: 300 })
    .withMessage("Le contenu du conseil ne doit pas dépasser 300 caractères."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Route pour récupérer tous les conseils avec informations du propriétaire
router.get("/", authenticateToken, getAllAdvice);

// Route pour soumettre un conseil et recevoir immédiatement un conseil aléatoire
router.post(
  "/",
  authenticateToken,
  validateAdviceContent,
  submitAdviceAndGetRandom
);

// Route pour récupérer un conseil aléatoire (indépendamment de la soumission immédiate)
router.get("/random", authenticateToken, getRandomAdvice);

// Route pour modifier un conseil (uniquement par l'auteur)
router.put("/:id", authenticateToken, validateAdviceContent, updateAdvice);

// Route pour supprimer un conseil (uniquement par l'auteur)
router.delete("/:id", authenticateToken, deleteAdvice);

module.exports = router;
