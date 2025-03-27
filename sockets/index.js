const { authenticateSocket } = require("../middlewares/authMiddleware");

module.exports = (io) => {
  // 🔐 Authentification de chaque socket
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.user?.userId;
    console.log(`✅ Socket connecté : ${socket.id} | Utilisateur : ${userId}`);

    /**
     * Rejoindre une salle spécifique (conseil)
     */
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📡 Utilisateur ${userId} a rejoint la salle ${roomId}`);
    });

    /**
     * Commentaire ajouté (backend => émet l’événement)
     */
    socket.on("newComment", (roomId, comment) => {
      socket.to(roomId).emit("comment:new", comment);
    });

    /**
     * Commentaire modifié
     */
    socket.on("updateComment", (roomId, comment) => {
      socket.to(roomId).emit("comment:update", comment);
    });

    /**
     * Commentaire supprimé
     */
    socket.on("deleteComment", (roomId, commentId) => {
      socket.to(roomId).emit("comment:delete", commentId);
    });

    /**
     * Déconnexion
     */
    socket.on("disconnect", (reason) => {
      console.log(`❌ Socket déconnecté : ${socket.id} | Raison : ${reason}`);
    });
  });
};
