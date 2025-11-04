import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage {
  _id?: any;
  text: string;
  time: string;
  date: string;
  isSent?: boolean;
  isRead?: boolean;
  messageStatus?: number; // 0: pending, 1: sent, 2: delivered, 3: read
  sanderUniqueCode: string;
  reciverUniqueCode: string;
  tempId?: string;
  createdAt?: Date;

  // ✅ reply support
  replyTo?: {
    _id?: Types.ObjectId | null;
    text?: string | null;
    sanderUniqueCode?: string | null;
    reciverUniqueCode?: string | null;
    date?: string | null;
    time?: string | null;
  };
  replyToText?: string | null;
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

  //  reply data
  replyTo: {
    _id: { type: String, required: false },
    text: { type: String, default: null },
    sanderUniqueCode: { type: String, default: null },
    reciverUniqueCode: { type: String, default: null },
    date: { type: String, default: null },
    time: { type: String, default: null },
  },
  replyToText: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
  {
    chatId: { type: String, required: true, unique: true },
    participants: { type: [String], required: true },
    chats: [
      {
        date: { type: String, required: true },
        messages: { type: [MessageSchema], default: [] },
      },
    ],
  },
  { timestamps: true }
);

export const Chat: Model<IChat> = mongoose.model<IChat>("Chat", ChatSchema);
