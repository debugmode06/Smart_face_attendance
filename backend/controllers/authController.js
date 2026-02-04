import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { encryptEmail } from "../utils/emailCrypto.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ================================================
    // 1️⃣ Generate HASH for lookup (required)
    // ================================================
    const emailHash = crypto
      .createHash("sha256")
      .update(email.toLowerCase().trim())
      .digest("hex");

    // ================================================
    // 2️⃣ Try encrypted email lookup first
    // ================================================
    let user = await User.findOne({ emailHash });

    // 3️⃣ If not found, fallback to old (non-encrypted) user record
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // ================================================
    // 4️⃣ AUTO-ENCRYPT EMAIL IF STILL PLAIN
    // ================================================
    if (!user.emailEnc) {
      user.emailEnc = encryptEmail(email); // AES-256-GCM encryption
      user.emailHash = emailHash;

      // Remove old plain email
      user.email = undefined;

      await user.save();
      console.log(`✔ Auto-encrypted email for ${email}`);
    }

    // ================================================
    // 5️⃣ PASSWORD CHECK (your same logic)
    // ================================================
    let isMatch = false;

    // CASE 1 — hashed password
    if (user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    // CASE 2 — plain password (upgrade automatically)
    else {
      if (password === user.password) {
        isMatch = true;

        // auto-migrate to hashed password
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
        console.log(`Upgraded password for ${email}`);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ================================================
    // 6️⃣ Generate token
    // ================================================
    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: email, // we return normal email to UI
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
