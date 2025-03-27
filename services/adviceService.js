// services/adviceService.js

const Advice = require("../models/Advice");

const adviceService = {
  async createAdvice(content, authorId, parentAdviceId = null) {
    return await Advice.create(content, authorId, parentAdviceId);
  },

  async getAllAdvice() {
    return await Advice.getAll();
  },

  async getAdviceById(adviceId) {
    return await Advice.getById(adviceId);
  },

  async getRandomAdvice(excludeAuthorId) {
    return await Advice.getRandomAdvice(excludeAuthorId);
  },

  async getUserAdviceCount(userId) {
    return await Advice.getUserAdviceCount(userId);
  },

  async updateAdvice(id, userId, content) {
    return await Advice.update(id, userId, content);
  },

  async deleteAdvice(id, userId) {
    return await Advice.delete(id, userId);
  },
};

module.exports = adviceService;
