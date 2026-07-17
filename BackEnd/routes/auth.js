const express = require("express");
const crypto = require("crypto");
const User = require("../Modules/user");

let bcrypt = null;
let jwt = null;

try {
  bcrypt = require("bcryptjs");
} catch (_error) {
  bcrypt = null;
}

try {
  jwt = require("jsonwebtoken");
} catch (_error) {
  jwt = null;
}

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "seed2success_jwt_fallback_secret";
const JWT_EXPIRES_IN = "7d";

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function fallbackHash(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
}

async function hashPassword(password) {
  if (bcrypt) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = fallbackHash(password, salt);
  return `pbkdf2$${salt}$${hash}`;
}

async function comparePassword(password, storedPassword) {
  if (bcrypt && !String(storedPassword).startsWith("pbkdf2$")) {
    return bcrypt.compare(password, storedPassword);
  }

  const [scheme, salt, storedHash] = String(storedPassword).split("$");

  if (scheme !== "pbkdf2" || !salt || !storedHash) {
    return false;
  }

  const computedHash = fallbackHash(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

function signToken(payload) {
  if (jwt) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const body = base64Url(JSON.stringify({ ...payload, exp }));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  if (jwt) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const computedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== computedSignature) return null;

    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decodedBody;
  } catch {
    return null;
  }
}

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
};

/**
 * POST /auth/register
 * Create a new user account.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, state, district } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      state: state ? state.trim() : "",
      district: district ? district.trim() : "",
    });

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        district: user.district,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Server error during registration." });
  }
});

/**
 * POST /auth/login
 * Authenticate an existing user.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        district: user.district,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

/**
 * GET /auth/profile
 * Get current user profile details.
 */
router.get("/profile", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      state: req.user.state,
      district: req.user.district,
    },
  });
});

/**
 * PUT /auth/profile
 * Update user profile details including location.
 */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, state, district } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (email) {
      const emailLower = email.toLowerCase().trim();
      if (emailLower !== user.email) {
        // Verify unique email
        const existing = await User.findOne({ email: emailLower });
        if (existing) {
          return res.status(400).json({ error: "Email is already taken." });
        }
        user.email = emailLower;
      }
    }

    if (state !== undefined) user.state = state.trim();
    if (district !== undefined) user.district = district.trim();

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        district: user.district,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ error: "Server error updating profile." });
  }
});

module.exports = router;
