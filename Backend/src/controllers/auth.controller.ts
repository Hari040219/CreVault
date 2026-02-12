import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import generateToken from "../utils/generateToken";

/**
 * REGISTER USER
 */
export const register = async (req: Request, res: Response) => {
  try {
    console.log("=== REGISTER REQUEST ===");
    console.log("Body:", req.body);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log("Missing fields:", { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("User created successfully:", user._id);

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN USER
 */
export const login = async (req: Request, res: Response) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Body:", req.body);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("Missing fields:", { email: !!email, password: !!password });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("User found:", user._id);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Password matched, generating token");

    // Generate token
    const token = generateToken(user._id.toString());

    console.log("Login successful for user:", email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
