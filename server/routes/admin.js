const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

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
  try {
    const userId = req.params.id;
    
    // Get user details for notification
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    await pool.query('UPDATE users SET is_banned = true WHERE id = $1', [userId]);
    
    // Notify the banned user
    try {
      await createNotification({
        user_id: userId,
        type: 'admin',
        title: 'Account Banned',
        message: 'Your account has been banned site-wide by an administrator',
        related_id: userId,
        related_type: 'user'
      });
    } catch (notifErr) {
      console.error('Failed to create ban notification:', notifErr);
    }
    
    res.json({ status: 'success', message: 'User banned site-wide' });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to ban user', error: err.message });
  }
});

router.post('/users/:id/unban', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details for notification
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    await pool.query('UPDATE users SET is_banned = false WHERE id = $1', [userId]);
    
    // Notify the unbanned user
    try {
      await createNotification({
        user_id: userId,
        type: 'admin',
        title: 'Account Unbanned',
        message: 'Your account has been unbanned site-wide by an administrator',
        related_id: userId,
        related_type: 'user'
      });
    } catch (notifErr) {
      console.error('Failed to create unban notification:', notifErr);
    }
    
    res.json({ status: 'success', message: 'User unbanned site-wide' });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to unban user', error: err.message });
  }
});

router.post('/users/:id/promote', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details for notification
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
    
    // Notify the promoted user
    try {
      await createNotification({
        user_id: userId,
        type: 'admin',
        title: 'Promoted to Administrator',
        message: 'You have been promoted to administrator by another admin',
        related_id: userId,
        related_type: 'user'
      });
    } catch (notifErr) {
      console.error('Failed to create promotion notification:', notifErr);
    }
    
    res.json({ status: 'success', message: 'User promoted to admin' });
  } catch (err) {
    console.error('Promote user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to promote user', error: err.message });
  }
});

router.post('/users/:id/demote', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user details for notification
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    await pool.query("UPDATE users SET role = 'user' WHERE id = $1", [userId]);
    
    // Notify the demoted user
    try {
      await createNotification({
        user_id: userId,
        type: 'admin',
        title: 'Demoted to Regular User',
        message: 'You have been demoted to regular user by an administrator',
        related_id: userId,
        related_type: 'user'
      });
    } catch (notifErr) {
      console.error('Failed to create demotion notification:', notifErr);
    }
    
    res.json({ status: 'success', message: 'User demoted to regular user' });
  } catch (err) {
    console.error('Demote user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to demote user', error: err.message });
  }
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
  try {
    const communityId = req.params.id;
    
    // Get community details and members for notification
    const communityResult = await pool.query(`
      SELECT c.*, u.username as created_by_username
      FROM communities c 
      JOIN users u ON c.created_by = u.id 
      WHERE c.id = $1
    `, [communityId]);
    
    if (communityResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Community not found' });
    }
    
    const community = communityResult.rows[0];
    
    // Get all community members to notify them
    const membersResult = await pool.query(`
      SELECT user_id FROM community_members WHERE community_id = $1
    `, [communityId]);
    
    // Notify all community members about deletion
    for (const member of membersResult.rows) {
      try {
        await createNotification({
          user_id: member.user_id,
          type: 'admin',
          title: 'Community Deleted',
          message: `The community "r/${community.name}" was deleted by a site administrator`,
          related_id: communityId,
          related_type: 'community'
        });
      } catch (notifErr) {
        console.error('Failed to create community deletion notification:', notifErr);
      }
    }
    
    // Delete the community
    await pool.query('DELETE FROM communities WHERE id = $1', [communityId]);
    
    res.json({ status: 'success', message: 'Community deleted' });
  } catch (err) {
    console.error('Delete community error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete community', error: err.message });
  }
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
  try {
    const postId = req.params.id;
    
    // Get post details for notification
    const postResult = await pool.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = $1
    `, [postId]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }
    
    const post = postResult.rows[0];
    
    // Notify the post owner about deletion
    try {
      await createNotification({
        user_id: post.user_id,
        type: 'admin',
        title: 'Post Deleted by Administrator',
        message: `Your post "${post.title}" was deleted by a site administrator`,
        related_id: postId,
        related_type: 'post'
      });
    } catch (notifErr) {
      console.error('Failed to create post deletion notification:', notifErr);
    }
    
    // Delete the post
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    
    res.json({ status: 'success', message: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete post', error: err.message });
  }
});

router.delete('/comments/:id', authenticateToken, requireAuth, requireAdmin, async (req, res) => {
  try {
    const commentId = req.params.id;
    
    // Get comment details for notification
    const commentResult = await pool.query(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1
    `, [commentId]);
    
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }
    
    const comment = commentResult.rows[0];
    
    // Notify the comment owner about deletion
    try {
      await createNotification({
        user_id: comment.user_id,
        type: 'admin',
        title: 'Comment Deleted by Administrator',
        message: 'Your comment was deleted by a site administrator',
        related_id: commentId,
        related_type: 'comment'
      });
    } catch (notifErr) {
      console.error('Failed to create comment deletion notification:', notifErr);
    }
    
    // Delete the comment
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    
    res.json({ status: 'success', message: 'Comment deleted' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete comment', error: err.message });
  }
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