const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// GET /api/chats - List all chats for the user
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT c.*, 
        CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END AS other_user_id,
        u.username AS other_username, u.avatar_url AS other_avatar
      FROM chats c
      JOIN users u ON u.id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json({ status: 'success', chats: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch chats', error: err.message });
  }
});

// POST /api/chats - Start a new chat (if not exists)
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.body.userId;
    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ status: 'error', message: 'Invalid userId' });
    }
    // Check if chat exists
    const checkQuery = `SELECT * FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`;
    const checkRes = await pool.query(checkQuery, [userId, otherUserId]);
    if (checkRes.rows.length > 0) {
      return res.json({ status: 'success', chat: checkRes.rows[0], existed: true });
    }
    // Create new chat
    const insertQuery = `INSERT INTO chats (user1_id, user2_id, created_at) VALUES ($1, $2, NOW()) RETURNING *`;
    const { rows } = await pool.query(insertQuery, [userId, otherUserId]);
    res.json({ status: 'success', chat: rows[0], existed: false });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to start chat', error: err.message });
  }
});

// GET /api/chats/:id/messages - Get messages in a chat
router.get('/:id/messages', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    // Check if user is participant
    const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
    if (chatRes.rows.length === 0) {
      return res.status(403).json({ status: 'error', message: 'Not a participant in this chat' });
    }
    const msgRes = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]);
    res.json({ status: 'success', messages: msgRes.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch messages', error: err.message });
  }
});

// POST /api/chats/:id/messages - Send a message
router.post('/:id/messages', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Message content required' });
    }
    // Check if user is participant
    const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
    if (chatRes.rows.length === 0) {
      return res.status(403).json({ status: 'error', message: 'Not a participant in this chat' });
    }
    const insertQuery = `INSERT INTO messages (chat_id, sender_id, content, is_read, created_at) VALUES ($1, $2, $3, false, NOW()) RETURNING *`;
    const { rows } = await pool.query(insertQuery, [chatId, userId, content]);
    res.json({ status: 'success', message: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to send message', error: err.message });
  }
});

module.exports = router; 