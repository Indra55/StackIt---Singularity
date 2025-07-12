const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./dbConfig');

// JWT secret key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authenticate user with email and password
const authenticateUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      async (err, results) => {
        if (err) {
          return reject(err);
        }

        if (results.rows.length === 0) {
          return reject(new Error('No user with that email'));
        }

        const user = results.rows[0];

        try {
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (isMatch) {
            return resolve(user);
          } else {
            return reject(new Error('Incorrect password'));
          }
        } catch (bcryptError) {
          return reject(bcryptError);
        }
      }
    );
  });
};

// Get user by ID
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT id, username, email, first_name, last_name, bio, avatar_url, reputation, role, is_banned, email_verified, last_login, is_online, created_at FROM users WHERE id = $1`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        if (results.rows.length === 0) {
          return reject(new Error('User not found'));
        }
        return resolve(results.rows[0]);
      }
    );
  });
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateUser,
  getUserById,
  JWT_SECRET
}; 