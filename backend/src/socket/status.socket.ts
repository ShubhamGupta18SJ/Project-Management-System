// import { Server, Socket } from "socket.io";

// export function statusSocket(io: Server, socket: Socket) {
//   console.log("📡 Status socket active:", socket.id);

//   socket.on("messageDelivered", (data: any) => {
//     io.emit("messageStatus", {
//       id: data.id,
//       messageStatus: 2 // Delivered 
//     });
//   });

//   socket.on("messageRead", (data: any) => {
//     io.emit("messageStatus", {
//       id: data.id,
//       messageStatus: 3 // Read  (blue)
//     });
//   });
// }

import { Server, Socket } from "socket.io";

export function statusSocket(io: Server, socket: Socket) {
  console.log("📡 Status socket active:", socket.id);

  socket.on("messageDelivered", (data: any) => {
    io.emit("messageStatus", {
      id: data.id,
      messageStatus: 2 // Delivered
    });
  });

  socket.on("messageRead", (data: any) => {
    io.emit("messageStatus", {
      id: data.id,
      messageStatus: 3 // Read ✔✔
    });
  });
}
