const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getAllAdvice,
  getAdviceById,
  submitAdviceAndGetRandom,
  getRandomAdvice,
  replyToAdvice,
  updateAdvice,
  deleteAdvice,
} = require("../controllers/adviceController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Middleware de validation du contenu d’un conseil
const validateAdviceContent = [
  body("content")
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage("Le contenu du conseil doit être entre 3 et 300 caractères."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// ✅ IMPORTANT : cette route doit être avant "/:id"
router.get("/random", authenticateToken, getRandomAdvice);

// Récupérer tous les conseils
router.get("/", authenticateToken, getAllAdvice);

// Soumettre un conseil
router.post(
  "/",
  authenticateToken,
  validateAdviceContent,
  submitAdviceAndGetRandom
);

// Répondre à un conseil
router.post(
  "/:id/reply",
  authenticateToken,
  validateAdviceContent,
  replyToAdvice
);

// Modifier un conseil
router.put("/:id", authenticateToken, validateAdviceContent, updateAdvice);

// Supprimer un conseil
router.delete("/:id", authenticateToken, deleteAdvice);

// Dernière : récupérer un conseil par ID
router.get("/:id", authenticateToken, getAdviceById);

module.exports = router;
