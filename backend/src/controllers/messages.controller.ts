import { Request, Response } from "express";
import { Chat } from "../models/messages.model";
import { addMessageSocket } from "../service/messageSocket.service";
import { User } from "../models/user.model";

/**
 * POST /api/messages/add
 * body: { sanderUniqueCode, reciverUniqueCode, text, time, date, tempId(optional) }
 * This API saves message and emits socket event (if io available on app)
 */
export const addMessage = async (req: Request, res: Response) => {
  try {
    const {
      sanderUniqueCode,
      reciverUniqueCode,
      text,
      time,
      date,
      tempId,
    } = req.body;

    // Build message object
    const msg = {
      text,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: date || new Date().toISOString().split("T")[0],
      sanderUniqueCode,
      reciverUniqueCode,
      tempId: tempId || null,
      messageStatus: 1,
      isSent: true,
      isRead: false,
    };

    // Use the same save helper as socket service to keep behaviour consistent
    // const { addMessageSocket } = await import("../service/messageSocket.service.js");
    const savedMsg = await addMessageSocket(msg);

    // Emit to receiver if socket available
    const io = req.app.get("io");
    const onlineUsers: Map<string, string> = req.app.get("onlineUsers");

    if (io && onlineUsers) {
      const receiverSocketId = onlineUsers.get(reciverUniqueCode);
      const senderSocketId = onlineUsers.get(sanderUniqueCode);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message", { ...savedMsg, messageStatus: 2 });
        // notify sender about delivered
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatus", {
            tempId,
            messageId: savedMsg._id,
            messageStatus: 2,
          });
        }
      } else {
        // receiver offline -> notify sender of sent (1)
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatus", {
            tempId,
            messageId: savedMsg._id,
            messageStatus: 1,
          });
        }
      }
    }

    return res.json({ success: true, message: "Message saved", data: savedMsg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", err });
  }
};


export const getChatByDate = async (req: Request, res: Response) => {
  try {
    const { sender, receiver, date } = req.params;
    const users = [sender, receiver].sort();
    const chatId = `${users[0]}_${users[1]}`;

    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.json({ success: true, data: { date, messages: [] } });
    }

    // find the chat of the requested date
    let chatDate = chat.chats.find((c: any) => c.date === date);

    // if not found, get the latest available date
    // if (!chatDate && chat.chats.length > 0) {
    //   // sort chats by date descending (latest first)
    //   const sortedChats = [...chat.chats].sort(
    //     (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    //   );
    //   chatDate = sortedChats[0];
    // }

    if (!chatDate && chat.chats.length > 0) {
      const sortedChats = [...chat.chats].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      chatDate = sortedChats[0];
    }


    if (!chatDate) {
      // still not found — empty result
      return res.json({ success: true, data: { date, messages: [] } });
    }

    // return messages for that found date
    return res.json({
      success: true,
      data: { date: chatDate.date, messages: chatDate.messages },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", err });
  }
};


export const getAllChats = async (req: Request, res: Response) => {
  try {
    const { sanderUniqueCode, reciverUniqueCode } = req.params;
    // We'll treat this as fetch conversation between two users
    const users = [sanderUniqueCode, reciverUniqueCode].sort();
    const chatId = `${users[0]}_${users[1]}`;

    const chat = await Chat.findOne({ chatId });
    if (!chat) return res.json({ success: true, data: [] });

    const filteredChats = chat.chats
      .map(c => ({
        date: c.date,
        messages: c.messages
          .filter((m: any) =>
            (m.sanderUniqueCode === sanderUniqueCode && m.reciverUniqueCode === reciverUniqueCode) ||
            (m.sanderUniqueCode === reciverUniqueCode && m.reciverUniqueCode === sanderUniqueCode)
          )
          .sort((a: any, b: any) => a.time.localeCompare(b.time))
      }))
      .filter(c => c.messages.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));

    return res.json({ success: true, data: filteredChats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", err });
  }
};

export const getChatBySender = async (req: Request, res: Response) => {
  try {
    const senderId = req.params.sanderUniqueCode;
    // get all chats where participants include senderId
    const chats = await Chat.find({ participants: { $in: [senderId] } });

    return res.json({ success: true, data: chats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", err });
  }
};

export const getUsersForChat = async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    const fakeChatData = users.map((u, index) => {
      return {
        username: u.username,
        email: u.email,
        uniqueCode: u.uniqueCode,
        avatar: `https://cdn-icons-png.flaticon.com/512/4333/433360${Math.floor(Math.random() * 6)}.png`,
        lastSeen: "Last seen recently",
        lastMsgTime: `22:${10 + index}`,
        unread: Math.floor(Math.random() * 6),
      };
    });

    res.status(200).json({
      status: true,
      message: "Chat users fetched successfully",
      data: fakeChatData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Failed to fetch chat users",
    });
  }
};

// export const getUsersForChat = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find();

//     const chatUsers = await Promise.all(users.map(async (u) => {
//       const chats = await Chat.find({ participants: u.uniqueCode });

//       // last message time
//       let lastMsgTime = null;
//       let lastMsgSeen = null;
//       let unreadCount = 0;

//       for (const chat of chats) {
//         for (const day of chat.chats) {
//           const lastMsg = day.messages[day.messages.length - 1];
//           if (!lastMsgTime || new Date(lastMsg.time) > new Date(lastMsgTime)) {
//             lastMsgTime = lastMsg.time;
//           }
//           lastMsgSeen=lastMsg
//           unreadCount += day.messages.filter(
//             m => m.reciverUniqueCode === u.uniqueCode && !m.isRead
//           ).length;
//         }
//       }

//       return {
//         username: u.username,
//         email: u.email,
//         uniqueCode: u.uniqueCode,
//         avatar: `https://cdn-icons-png.flaticon.com/512/4333/433360${Math.floor(Math.random() * 6)}.png`,
//         lastSeen: lastMsgSeen,
//         lastMsgTime: lastMsgTime,
//         unread: unreadCount
//       };
//     }));

//     res.status(200).json({
//       status: true,
//       message: "Chat users fetched successfully",
//       data: chatUsers
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       status: false,
//       message: "Failed to fetch chat users"
//     });
//   }
// };
