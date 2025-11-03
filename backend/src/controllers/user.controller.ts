import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

//  CREATE (Register)
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, uniqueCode, password } = req.body;

    if (!username || !email || !uniqueCode || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, uniqueCode, password: hashedPassword });

    const saved = await user.save();
    return res.status(201).json({ success: true, message: "User registered successfully", data: saved });
  } catch (err) {
    next(err);
  }
};

//  READ ALL
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ success: true, message: "Users retrieved successfully", data: users });
  } catch (err) {
    next(err);
  }
};

//  READ ONE
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User retrieved successfully", data: user });
  } catch (err) {
    next(err);
  }
};

//  UPDATE
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, ...rest } = req.body;

    let updateData = { ...rest };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (err) {
    next(err);
  }
};

//  DELETE
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
