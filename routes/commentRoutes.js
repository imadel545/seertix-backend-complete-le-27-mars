const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getCommentsByAdviceId,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentLikes,
} = require("../controllers/commentController");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Middleware pour valider le contenu des commentaires
const validateCommentContent = [
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Le contenu du commentaire ne peut pas être vide."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Routes pour la gestion des commentaires
router.get("/:adviceId", authenticateToken, getCommentsByAdviceId);
router.post("/", authenticateToken, validateCommentContent, addComment);
router.put("/:id", authenticateToken, validateCommentContent, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

// Routes pour les likes de commentaires
router.post("/:id/like", authenticateToken, likeComment);
router.post("/:id/unlike", authenticateToken, unlikeComment);
router.get("/:id/likes", authenticateToken, getCommentLikes);

module.exports = router;
