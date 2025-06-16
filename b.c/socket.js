import express from "express";
import { Server } from "socket.io";
import http from "http";

// Express app setup
const app = express();
const server = http.createServer(app); // Express server ko HTTP server me wrap kiya

// userId => Set of socketIds mapping (ek user ke multiple tabs ho sakte hain)
const userSocketMap = {};

// Socket.io server banaya with CORS config
const io = new Server(server, {
  cors: {
    origin: process.env.URL || "http://localhost:3000", // frontend ka origin
    methods: ["GET", "POST"],
    credentials: true, // Cookies allow karne ke liye
  },
});

// Utility function: kisi user ke sabhi socketIds return karta hai
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId]
    ? Array.from(userSocketMap[receiverId]) // Set ko Array me convert
    : []; // agar nahi mila toh empty array
};

// Jab koi client socket se connect hota hai
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // frontend se query param me userId bhejna hoga

  if (!userId) {
    console.warn("User ID missing in socket connection"); // agar userId nahi bheja toh warn karo
    return;
  }

  // Map me userId ke under socket.id add karo (ek user ke multiple tabs ho sakte hain)
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set(); // naya Set banao agar pehle se nahi hai
  }
  userSocketMap[userId].add(socket.id);

  // Sabhi users ko updated online users ka list bhejo
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Object.keys se sirf userId milti hai

  // Custom event: Jab koi "sendNotification" emit kare
  socket.on("sendNotification", ({ receiverId, notification }) => {
    const receiverSockets = getReceiverSocketId(receiverId); // jis user ko bhejna hai, uske sabhi socketId lao
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("notification", notification); // real-time notification bhejo
    });
  });

  // Jab user disconnect karta hai (tab close, refresh, net down, etc.)
  socket.on("disconnect", () => {
    userSocketMap[userId]?.delete(socket.id); // uska socketId hatao

    // Agar Set empty ho gaya toh pura user hata do
    if (userSocketMap[userId]?.size === 0) {
      delete userSocketMap[userId];
    }

    // Update online users list sabko
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export sab chiz taaki backend me use kar sake
export { app, server, io, getReceiverSocketId };
