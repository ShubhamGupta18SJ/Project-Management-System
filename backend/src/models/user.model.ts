import { Schema, model, Document } from "mongoose";

export interface IChatUser extends Document {
  username: string;
  email: string;
  uniqueCode: string;
  password: string;
}

const userSchema = new Schema<IChatUser>(
  {
    username: { type: String, required: true, unique: true },
    uniqueCode: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = model<IChatUser>("User", userSchema);
