const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Set it in .env before starting the server.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    agency: { type: String },
    role: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

const toAppUser = (user) => ({
  id: user._id.toString(),
  username: user.name || user.email,
  email: user.email,
  role: user.role,
  status: user.status,
});

const toPendingUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  agency: user.agency ?? "",
  role: user.role,
  submittedAt: user.createdAt.toISOString(),
});

const createToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, agency, role, password } = req.body || {};
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      agency,
      role,
      passwordHash,
      status: "pending",
    });

    res.status(201).json({ pendingId: user._id.toString() });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ email: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    res.json({
      token,
      user: toAppUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/admin/pending-users", async (_req, res) => {
  try {
    const pending = await User.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(pending.map(toPendingUser));
  } catch (error) {
    console.error("List pending error:", error);
    res.status(500).json({ message: "Failed to load pending users" });
  }
});

app.post("/admin/pending-users/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, status: "pending" });
    if (!user) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    user.status = "approved";
    await user.save();
    res.status(204).end();
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Failed to approve user" });
  }
});

app.post("/admin/pending-users/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, status: "pending" });
    if (!user) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    await user.deleteOne();
    res.status(204).end();
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Failed to reject user" });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
