// import dotenv from "dotenv";
// import http from "http";
// import { Server as SocketIOServer } from "socket.io";
// import app from "./app";
// import { connectDB } from "./config/db";
// import messageRoutes from "./routes/messages.routes";
// import { addMessageSocket, updateMessagesToSeen } from "./service/messageSocket.service";

// dotenv.config();
// connectDB();

// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app);

// const io = new SocketIOServer(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// // Map to track online users: uniqueCode -> socketId
// const onlineUsers = new Map<string, string>();

// // Attach io & onlineUsers to express app so controllers can access them
// app.set("io", io);
// app.set("onlineUsers", onlineUsers);

// // Routes (normal express APIs)
// app.use("/api/messages", messageRoutes);

// // Socket logic
// io.on("connection", (socket) => {
//   console.log("🟢 User connected:", socket.id);

//   // user registers his uniqueCode after connecting
//   socket.on("register-user", (uniqueCode: string) => {
//     if (!uniqueCode) return;
//     onlineUsers.set(uniqueCode, socket.id);
//     console.log(` Registered ${uniqueCode} -> ${socket.id}`);
//   });

//   // Receive message from client via socket
//   // msg should contain sanderUniqueCode, reciverUniqueCode, text, time, date, messageStatus (optional)
//   socket.on("message", async (msg: any) => {
//     try {
//       // Save to DB via service that we'll implement (it uses pair-based chatId)
//       const saved = await addMessageSocket(msg);
//       // Notify receiver if online
//       const receiverSocketId = onlineUsers.get(msg.reciverUniqueCode);
//       if (receiverSocketId) {
//         // send the message to receiver (delivered)
//         io.to(receiverSocketId).emit("message", {
//           ...saved,
//           messageStatus: 2, // delivered/received
//         });

//         // tell sender that message was delivered (update status)
//         socket.emit("messageStatus", {
//           tempId: msg.tempId || null,
//           messageId: saved._id || null,
//           messageStatus: 2,
//         });
//       } else {
//         // receiver offline -> sender gets sent status (1)
//         socket.emit("messageStatus", {
//           tempId: msg.tempId || null,
//           messageId: saved._id || null,
//           messageStatus: 1,
//         });
//       }
//     } catch (err) {
//       console.error("Socket message handling error:", err);
//       socket.emit("messageStatus", {
//         tempId: msg.tempId || null,
//         messageStatus: 0,
//       });
//     }
//   });

//   // When a client marks messages as read/seen
//   // data: { senderCode, receiverCode, date? }
//   socket.on("readMessages", async (data: any) => {
//     try {
//       await updateMessagesToSeen(data);

//       // inform sender (if online) that their messages are seen
//       const senderSocket = onlineUsers.get(data.senderCode);
//       if (senderSocket) {
//         io.to(senderSocket).emit("messagesSeen", {
//           senderCode: data.senderCode,
//           receiverCode: data.receiverCode,
//           messageStatus: 3,
//         });
//       }
//       // also confirm to the client who fired event
//       socket.emit("messagesSeenAck", { ok: true });
//     } catch (err) {
//       console.error("readMessages error:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 User disconnected:", socket.id);
//     // remove from onlineUsers
//     for (const [code, id] of onlineUsers) {
//       if (id === socket.id) {
//         onlineUsers.delete(code);
//         break;
//       }
//     }
//   });
// });

// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDB } from "./config/db";
import messageRoutes from "./routes/messages.routes";
import { addMessageSocket, updateMessagesToSeen } from "./service/messageSocket.service";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:4200", //  safer than "*"
    methods: ["GET", "POST"],
  },
});

// 🧩 Map to track online users (uniqueCode -> socketId)
const onlineUsers = new Map<string, string>();

// Attach io & onlineUsers to Express app for access in controllers if needed
app.set("io", io);
app.set("onlineUsers", onlineUsers);

//  Normal REST APIs
app.use("/api/messages", messageRoutes);

// 🧠 SOCKET.IO LOGIC
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  //  Register user (client sends uniqueCode)
  socket.on("register-user", (uniqueCode: string) => {
    if (!uniqueCode) return;
    onlineUsers.set(uniqueCode, socket.id);
    console.log(` Registered ${uniqueCode} -> ${socket.id}`);
  });

  //  Handle incoming message
  socket.on("message", async (msg: any) => {
    try {
      // Save message to DB
      const saved = await addMessageSocket(msg);

      // Get receiver socket
      const receiverSocketId = onlineUsers.get(msg.reciverUniqueCode);

      if (receiverSocketId) {
        console.log(`📨 Sending message to receiver ${msg.reciverUniqueCode}`);

        // Send message to receiver (delivered)
        io.to(receiverSocketId).emit("message", {
          ...saved,
          messageStatus: 2, // delivered
        });

        // Tell sender message was delivered
        socket.emit("messageStatus", {
          tempId: msg.tempId || null,
          messageId: saved._id || null,
          messageStatus: 2,
        });
      } else {
        // Receiver offline → sender sees message as sent only
        socket.emit("messageStatus", {
          tempId: msg.tempId || null,
          messageId: saved._id || null,
          messageStatus: 1,
        });
      }
    } catch (err) {
      console.error("❌ Socket message handling error:", err);
      socket.emit("messageStatus", {
        tempId: msg.tempId || null,
        messageStatus: 0,
      });
    }
  });

  //  Handle “read messages” event
  socket.on("readMessages", async (data: any) => {
    try {
      // Update DB
      await updateMessagesToSeen(data);
      // Inform sender (if online)
      const senderSocket = onlineUsers.get(data.senderCode);
      if (senderSocket) {
        io.to(senderSocket).emit("messagesSeen", {
          senderCode: data.senderCode,
          receiverCode: data.receiverCode,
          messageStatus: 3, // seen
        });
      }

      // Acknowledge to the receiver (who triggered read)
      socket.emit("messagesSeenAck", { ok: true });
    } catch (err) {
      console.error("⚠️ readMessages error:", err);
    }
  });

  //  Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    // Remove from online users
    for (const [code, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(code);
        console.log(`❌ Removed user: ${code}`);
        break;
      }
    }
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
