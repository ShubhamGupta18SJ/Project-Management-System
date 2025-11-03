import { Server, Socket } from "socket.io";

export function chatSocket(io: Server, socket: Socket) {
  console.log("💬 Chat socket active:", socket.id);

  socket.on("message", (msg: any) => {
    console.log("📨 Incoming MSG:", msg);
    
    // Broadcast only to receiver
    socket.broadcast.emit("message", msg);

    // Respond back to sender that message is sent 
    socket.emit("messageStatus", {
      id: msg.id,
      messageStatus: 1 // Sent
    });
  });
}
