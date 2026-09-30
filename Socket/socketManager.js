const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on("register_admin", () => {
      socket.join("admins");
    });

    socket.on("register_user", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on("register_contact_watch", (userId) => {
      if (userId) socket.join(`contact:${userId}`);
    });

    // Mobile client streams live coordinates while an SOS is active
    socket.on("location_update", ({ sosId, userId, latitude, longitude }) => {
      io.to("admins").emit("location_update", { sosId, userId, latitude, longitude });
      io.to(`contact:${userId}`).emit("location_update", { sosId, userId, latitude, longitude });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};

module.exports = { initSocket, getIO };
