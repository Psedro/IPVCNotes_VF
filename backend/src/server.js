import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Cliente desligou-se:", socket.id);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Server a correr em http://localhost:${PORT}`);
});
