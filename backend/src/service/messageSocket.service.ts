
import { Chat } from "../models/messages.model";

import { Server } from "socket.io";
export const addMessageSocket = async (msg: any) => {
  try {
    const date = msg.date || new Date().toISOString().split("T")[0];

    const users = [msg.sanderUniqueCode, msg.reciverUniqueCode].sort();
    const chatId = `${users[0]}_${users[1]}`;

    let chat = await Chat.findOne({ chatId });

    const messageToStore = {
      text: msg.text,
      time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date,
      isSent: true,
      isRead: false,
      messageStatus: msg.messageStatus ?? 1,
      sanderUniqueCode: msg.sanderUniqueCode,
      reciverUniqueCode: msg.reciverUniqueCode,
      tempId: msg.tempId || null,
      createdAt: new Date(),
    };

    if (!chat) {
      chat = new Chat({
        chatId,
        participants: users,
        chats: [{ date, messages: [messageToStore] }],
      });
    } else {
      let chatDate = chat.chats.find((c: any) => c.date === date);
      if (!chatDate) {
        chat.chats.push({ date, messages: [messageToStore] });
      } else {
        chatDate.messages.push(messageToStore);
      }
    }

    const saved = await chat.save();

    // Return the saved message object (last message pushed)
    // Find the saved message (last in array)
    const savedChat = await Chat.findOne({ chatId });
    const lastDate = savedChat!.chats.find((c: any) => c.date === date);
    const lastMsg = lastDate!.messages[lastDate!.messages.length - 1];

    return lastMsg;
  } catch (err) {
    console.error("❌ Socket DB Error", err);
    throw err;
  }
};

export const updateMessagesToSeen = async (data: any) => {
  try {
    const users = [data.senderCode, data.receiverCode].sort();
    const chatId = `${users[0]}_${users[1]}`;

    const chat = await Chat.findOne({ chatId });
    if (!chat) return;

    for (const day of chat.chats) {
      for (const msg of day.messages) {
        if (
          msg.sanderUniqueCode === data.senderCode &&
          msg.reciverUniqueCode === data.receiverCode &&
          !msg.isRead
        ) {
          msg.isRead = true;
          msg.messageStatus = 3;
        }
      }
    }

    await chat.save();
    return true;
  } catch (err) {
    console.error("updateMessagesToSeen error", err);
    throw err;
  }
};

