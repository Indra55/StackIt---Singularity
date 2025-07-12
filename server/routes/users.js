const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const  pool  = require("../config/dbConfig");
const { checkAuthenticated, checkNotAuthenticated } = require("../middleware/auth");

router.get("/login", checkAuthenticated, (req, res) => {
  res.json({
    message: "Login page",
    status: "success",
    authenticated: false
  });
});

router.get("/register", checkAuthenticated, (req, res) => {
  res.json({
    message: "Register page",
    status: "success",
    authenticated: false
  });
});

router.get("/dashboard", checkNotAuthenticated, (req, res) => {
  res.json({
    message: "Dashboard",
    status: "success",
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    },
    authenticated: true
  });
});

router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({
      message: "You are logged out",
      status: "success",
      authenticated: false
    });
  });
});

router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;
  let errors = [];

  if (!username || !email || !password) {
    errors.push({ message: "Please enter all fields" });
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
  pool.query(`SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
    if (results.rows.length > 0) {
      errors.push({ message: "User already exists" });
      return res.status(400).json({
        message: "Registration failed",
        status: "error",
        errors
      });
    } else {
      pool.query(`INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`, 
        [username, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
            status: "error",
            error: err.message
          });
        }
        res.json({
          message: "You are now registered",
          status: "success",
          user: {
            id: result.rows[0].id,
            username,
            email
          }
        });
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: "Authentication error",
        status: "error",
        error: err.message
      });
    }
    if (!user) {
      return res.status(401).json({
        message: info.message || "Invalid credentials",
        status: "error"
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({
          message: "Login error",
          status: "error",
          error: err.message
        });
      }
      res.json({
        message: "Login successful",
        status: "success",
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        authenticated: true
      });
    });
  })(req, res, next);
});

module.exports = router;
