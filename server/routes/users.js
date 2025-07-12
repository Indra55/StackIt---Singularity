const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/dbConfig");
const { authenticateToken, requireAuth, checkNotAuthenticated } = require("../middleware/auth");
const { generateToken, authenticateUser } = require("../config/jwtConfig");

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.json({
    message: "Login page",
    status: "success",
    authenticated: false
  });
});

router.get("/register", checkNotAuthenticated, (req, res) => {
  res.json({
    message: "Register page",
    status: "success",
    authenticated: false
  });
});

router.get("/dashboard", authenticateToken, requireAuth, (req, res) => {
  res.json({
    message: "Dashboard",
    status: "success",
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      bio: req.user.bio,
      avatar_url: req.user.avatar_url,
      reputation: req.user.reputation,
      role: req.user.role,
      is_banned: req.user.is_banned,
      email_verified: req.user.email_verified,
      last_login: req.user.last_login,
      is_online: req.user.is_online,
      created_at: req.user.created_at
    },
    authenticated: true
  });
});

router.get("/profile", authenticateToken, requireAuth, (req, res) => {
  res.json({
    message: "User profile",
    status: "success",
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      bio: req.user.bio,
      avatar_url: req.user.avatar_url,
      reputation: req.user.reputation,
      role: req.user.role,
      is_banned: req.user.is_banned,
      email_verified: req.user.email_verified,
      last_login: req.user.last_login,
      is_online: req.user.is_online,
      created_at: req.user.created_at
    },
    authenticated: true
  });
});

router.post("/register", async (req, res) => {
  let { username, email, password, first_name, last_name, bio } = req.body;
  let errors = [];

  if (!username || !email || !password) {
    errors.push({ message: "Please enter all required fields" });
  }
  if (password.length < 7) {
    errors.push({ message: "Password must be at least 8 characters" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      status: "error",
      errors
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const currentTime = new Date();
  
  pool.query(`SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
    if (results.rows.length > 0) {
      errors.push({ message: "User already exists" });
      return res.status(400).json({
        message: "Registration failed",
        status: "error",
        errors
      });
    } else {
      pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, bio, reputation, role, is_banned, email_verified, is_online, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING id, username, email, first_name, last_name, bio, reputation, role, created_at`, 
        [username, email, hashedPassword, first_name || null, last_name || null, bio || null, 0, 'user', false, false, false, currentTime, currentTime], 
        (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
            status: "error",
            error: err.message
          });
        }
        
        const user = result.rows[0];
        const token = generateToken(user);
        
        res.json({
          message: "You are now registered",
          status: "success",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            bio: user.bio,
            reputation: user.reputation,
            role: user.role,
            created_at: user.created_at
          },
          token,
          authenticated: true
        });
      });
    }
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "error"
      });
    }

    const user = await authenticateUser(email, password);
    
    // Update last_login and is_online
    const currentTime = new Date();
    await pool.query(
      `UPDATE users SET last_login = $1, is_online = $2, updated_at = $3 WHERE id = $4`,
      [currentTime, true, currentTime, user.id]
    );
    
    const token = generateToken(user);
    
    res.json({
      message: "Login successful",
      status: "success",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        reputation: user.reputation,
        role: user.role,
        is_banned: user.is_banned,
        email_verified: user.email_verified,
        last_login: currentTime,
        is_online: true,
        created_at: user.created_at
      },
      token,
      authenticated: true
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Invalid credentials",
      status: "error"
    });
  }
});

router.post("/logout", authenticateToken, requireAuth, async (req, res) => {
  try {
    // Update is_online status
    await pool.query(
      `UPDATE users SET is_online = $1, updated_at = $2 WHERE id = $3`,
      [false, new Date(), req.user.id]
    );
    
    res.json({
      message: "Logout successful",
      status: "success",
      authenticated: false
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout error",
      status: "error",
      error: error.message
    });
  }
});

module.exports = router;
