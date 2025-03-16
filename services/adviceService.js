const Advice = require("../models/Advice");

const adviceService = {
  async createAdvice(content, authorId) {
    if (!content || content.length < 3 || content.length > 300) {
      throw new Error("Le contenu doit être entre 3 et 300 caractères.");
    }

    try {
      return await Advice.create(content, authorId);
    } catch (error) {
      console.error("❌ Erreur lors de la création d’un conseil :", error);
      throw new Error("Erreur lors de la création du conseil.");
    }
  },

  async getAllAdvice() {
    try {
      return await Advice.getAll();
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des conseils :", error);
      throw new Error("Erreur lors de la récupération des conseils.");
    }
  },

  async getRandomAdvice() {
    try {
      return await Advice.getRandomAdvice();
    } catch (error) {
      console.error("❌ Erreur lors de la récupération d’un conseil aléatoire :", error);
      throw new Error("Erreur lors de la récupération du conseil.");
    }
  },

  async deleteAdvice(id, authorId) {
    try {
      return await Advice.delete(id, authorId);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression d’un conseil :", error);
      throw new Error("Erreur lors de la suppression du conseil.");
    }
  },
};

module.exports = adviceService;
