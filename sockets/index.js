module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Nouvelle connexion Socket: " + socket.id);

    // Exemple d'écoute d'événement personnalisé
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} a rejoint la salle ${room}`);
    });

    // Déconnexion
    socket.on("disconnect", () => {
      console.log("Socket déconnecté: " + socket.id);
    });
  });
};
