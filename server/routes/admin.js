const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Middleware: Only allow admins
const requireAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin privileges required' });
  }
  next();
};

// --- USER MANAGEMENT ---
router.get('/users', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  // TODO: Add search/filter/pagination
  const users = await pool.query('SELECT id, username, email, role, is_banned, created_at FROM users ORDER BY created_at DESC');
  res.json({ status: 'success', users: users.rows });
});

router.get('/users/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const user = await pool.query('SELECT id, username, email, role, is_banned, created_at FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
  res.json({ status: 'success', user: user.rows[0] });
});

router.post('/users/:id/ban', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query('UPDATE users SET is_banned = true WHERE id = $1', [userId]);
  res.json({ status: 'success', message: 'User banned site-wide' });
});

router.post('/users/:id/unban', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query('UPDATE users SET is_banned = false WHERE id = $1', [userId]);
  res.json({ status: 'success', message: 'User unbanned site-wide' });
});

router.post('/users/:id/promote', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
  res.json({ status: 'success', message: 'User promoted to admin' });
});

router.post('/users/:id/demote', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  await pool.query("UPDATE users SET role = 'user' WHERE id = $1", [userId]);
  res.json({ status: 'success', message: 'User demoted to regular user' });
});

// --- COMMUNITY MANAGEMENT ---
router.get('/communities', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const communities = await pool.query('SELECT id, name, description, post_count, member_count, created_at FROM communities ORDER BY created_at DESC');
  res.json({ status: 'success', communities: communities.rows });
});

router.get('/communities/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const communityId = req.params.id;
  const community = await pool.query('SELECT id, name, description, post_count, member_count, created_at FROM communities WHERE id = $1', [communityId]);
  if (community.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Community not found' });
  res.json({ status: 'success', community: community.rows[0] });
});

router.delete('/communities/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const communityId = req.params.id;
  await pool.query('DELETE FROM communities WHERE id = $1', [communityId]);
  res.json({ status: 'success', message: 'Community deleted' });
});

// --- CONTENT MODERATION ---
router.get('/posts', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const posts = await pool.query('SELECT id, title, user_id, community_id, created FROM posts ORDER BY created DESC');
  res.json({ status: 'success', posts: posts.rows });
});

router.get('/comments', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const comments = await pool.query('SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at DESC');
  res.json({ status: 'success', comments: comments.rows });
});

router.delete('/posts/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const postId = req.params.id;
  await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
  res.json({ status: 'success', message: 'Post deleted' });
});

router.delete('/comments/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const commentId = req.params.id;
  await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
  res.json({ status: 'success', message: 'Comment deleted' });
});

// --- SITE METRICS ---
router.get('/metrics', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  const userCount = await pool.query('SELECT COUNT(*) FROM users');
  const communityCount = await pool.query('SELECT COUNT(*) FROM communities');
  const postCount = await pool.query('SELECT COUNT(*) FROM posts');
  const commentCount = await pool.query('SELECT COUNT(*) FROM comments');
  const activeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '1 day'");
  res.json({
    status: 'success',
    metrics: {
      users: parseInt(userCount.rows[0].count, 10),
      communities: parseInt(communityCount.rows[0].count, 10),
      posts: parseInt(postCount.rows[0].count, 10),
      comments: parseInt(commentCount.rows[0].count, 10),
      activeUsers: parseInt(activeUsers.rows[0].count, 10)
    }
  });
});

module.exports = router; 