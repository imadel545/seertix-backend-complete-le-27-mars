const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getAllAdvice,
  addAdvice,
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

// Routes protégées par un token JWT
router.get("/", authenticateToken, getAllAdvice);
router.post("/", authenticateToken, validateAdviceContent, addAdvice);
router.get("/random", authenticateToken, getRandomAdvice);
router.put("/:id", authenticateToken, validateAdviceContent, updateAdvice);
router.delete("/:id", authenticateToken, deleteAdvice);

module.exports = router;
