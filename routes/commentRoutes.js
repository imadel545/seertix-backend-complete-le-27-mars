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
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Validation du contenu des commentaires
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

// ✅ Routes
router.get("/:adviceId", authenticateToken, getCommentsByAdviceId);
router.post("/", authenticateToken, validateCommentContent, addComment);
router.put("/:id", authenticateToken, validateCommentContent, updateComment);
router.delete("/:id", authenticateToken, deleteComment);

// ✅ Gestion des likes
router.post("/:id/like", authenticateToken, likeComment);
router.delete("/:id/unlike", authenticateToken, unlikeComment);
router.get("/:id/likes", authenticateToken, getCommentLikes);

module.exports = router;
