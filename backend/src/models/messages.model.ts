// src/models/messages.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  _id?: any;
  text: string;
  time: string;
  date: string;
  isSent?: boolean;
  isRead?: boolean;
  messageStatus?: number; // 0,1,2,3
  sanderUniqueCode: string;
  reciverUniqueCode: string;
  tempId?: string; // optional client temporary id
  createdAt?: Date;
}

export interface IChat extends Document {
  chatId: string; // sorted pair id like A_B
  participants: string[]; // [A,B]
  chats: {
    date: string;
    messages: IMessage[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  text: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
  isSent: { type: Boolean, default: true },
  isRead: { type: Boolean, default: false },
  messageStatus: { type: Number, default: 1 },
  sanderUniqueCode: { type: String, required: true },
  reciverUniqueCode: { type: String, required: true },
  tempId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  chatId: { type: String, required: true, unique: true },
  participants: { type: [String], required: true },
  chats: [
    {
      date: { type: String, required: true },
      messages: { type: [MessageSchema], default: [] },
    },
  ],
}, { timestamps: true });

export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", ChatSchema);
