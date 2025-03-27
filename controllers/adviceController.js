// controllers/adviceController.js
const adviceService = require("../services/adviceService");

exports.getAllAdvice = async (req, res) => {
  try {
    const advices = await adviceService.getAllAdvice();
    res.json(advices);
  } catch (err) {
    console.error("❌ Erreur récupération conseils :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.getAdviceById = async (req, res) => {
  const adviceId = req.params.id;

  try {
    const advice = await adviceService.getAdviceById(adviceId);
    if (!advice) {
      return res.status(404).json({ error: "Conseil non trouvé." });
    }
    res.json(advice);
  } catch (err) {
    console.error("❌ Erreur récupération conseil :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.submitAdviceAndGetRandom = async (req, res) => {
  const { content } = req.body;
  const authorId = req.user.userId;

  try {
    const newAdvice = await adviceService.createAdvice(content, authorId);
    const randomAdvice = await adviceService.getRandomAdvice(authorId);

    if (!randomAdvice) {
      return res.status(201).json({
        message: "Conseil soumis, mais aucun autre conseil à afficher.",
        newAdvice,
      });
    }

    res.status(201).json({
      message: "Conseil soumis avec succès.",
      newAdvice,
      randomAdvice,
    });
  } catch (err) {
    console.error("❌ Erreur soumission conseil :", err.message);
    res.status(500).json({ error: "Erreur lors de la soumission du conseil." });
  }
};

exports.getRandomAdvice = async (req, res) => {
  const userId = req.user.userId;

  try {
    const count = await adviceService.getUserAdviceCount(userId);
    if (count === 0) {
      return res.status(403).json({
        error: "Soumettez un conseil avant d'en recevoir un autre.",
      });
    }

    const randomAdvice = await adviceService.getRandomAdvice(userId);
    if (!randomAdvice) {
      return res.status(404).json({ error: "Aucun conseil disponible." });
    }

    res.json(randomAdvice);
  } catch (err) {
    console.error("❌ Erreur récupération aléatoire :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.replyToAdvice = async (req, res) => {
  const { content } = req.body;
  const parentId = parseInt(req.params.id, 10);
  const authorId = req.user.userId;

  try {
    const reply = await adviceService.createAdvice(content, authorId, parentId);
    res.status(201).json({ message: "Réponse ajoutée", advice: reply });
  } catch (err) {
    console.error("❌ Erreur ajout réponse :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.updateAdvice = async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const updated = await adviceService.updateAdvice(id, userId, content);
    if (!updated) {
      return res.status(403).json({
        error: "Vous ne pouvez modifier que vos propres conseils.",
      });
    }

    res.json({ message: "Conseil mis à jour", advice: updated });
  } catch (err) {
    console.error("❌ Erreur mise à jour :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

exports.deleteAdvice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const deleted = await adviceService.deleteAdvice(id, userId);
    if (!deleted) {
      return res.status(403).json({
        error: "Vous ne pouvez supprimer que vos propres conseils.",
      });
    }

    res.json({ message: "Conseil supprimé avec succès." });
  } catch (err) {
    console.error("❌ Erreur suppression :", err.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
