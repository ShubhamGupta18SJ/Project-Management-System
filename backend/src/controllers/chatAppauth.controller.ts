import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-token";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login success",
      token,
      user: { username: user.username, email: user.email, uniqueCode: user.uniqueCode }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
