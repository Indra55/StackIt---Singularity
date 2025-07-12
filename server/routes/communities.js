const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const { isModerator, isAdmin, checkBanStatus } = require('../middleware/moderator');
const { createNotification } = require('./notifications');

// GET /api/communities - Get all public communities
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.member_count,
        c.post_count,
        c.is_public,
        c.created_at,
        u.username as created_by_username
      FROM communities c
      JOIN users u ON c.created_by = u.id
      WHERE c.is_public = true
      ORDER BY c.member_count DESC, c.created_at DESC
    `;
    
    const { rows } = await pool.query(query);
    
    res.json({
      status: 'success',
      communities: rows
    });
  } catch (err) {
    console.error('Get communities error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch communities',
      error: err.message
    });
  }
});

// GET /api/communities/:name - Get specific community
router.get('/:name', async (req, res) => {
  try {
    const communityName = req.params.name;
    
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.member_count,
        c.post_count,
        c.is_public,
        c.created_at,
        u.username as created_by_username
      FROM communities c
      JOIN users u ON c.created_by = u.id
      WHERE c.name = $1
    `;
    
    const { rows } = await pool.query(query, [communityName]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community not found'
      });
    }
    
    res.json({
      status: 'success',
      community: rows[0]
    });
  } catch (err) {
    console.error('Get community error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch community',
      error: err.message
    });
  }
});

// POST /api/communities - Create a new community
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { name, description, is_public = true } = req.body;
    const userId = req.user.id;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Community name is required'
      });
    }
    
    // Validate community name (alphanumeric, hyphens, underscores only)
    const nameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        status: 'error',
        message: 'Community name can only contain letters, numbers, hyphens, and underscores'
      });
    }
    
    // Check if community name already exists
    const existingQuery = 'SELECT id FROM communities WHERE name = $1';
    const existingResult = await pool.query(existingQuery, [name.toLowerCase()]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Community name already exists'
      });
    }
    
    // Create community
    const createQuery = `
      INSERT INTO communities (name, description, created_by, is_public, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, description, member_count, post_count, is_public, created_at
    `;
    
    const createResult = await pool.query(createQuery, [
      name.toLowerCase(),
      description || null,
      userId,
      is_public
    ]);
    
    const community = createResult.rows[0];
    
    // Add creator as admin member
    const memberQuery = `
      INSERT INTO community_members (community_id, user_id, role, joined_at)
      VALUES ($1, $2, 'admin', NOW())
    `;
    
    await pool.query(memberQuery, [community.id, userId]);
    
    // Update member count
    await pool.query(
      'UPDATE communities SET member_count = 1 WHERE id = $1',
      [community.id]
    );
    
    res.json({
      status: 'success',
      message: 'Community created successfully',
      community: community
    });
  } catch (err) {
    console.error('Create community error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create community',
      error: err.message
    });
  }
});

// POST /api/communities/:name/join - Join a community
router.post('/:name/join', authenticateToken, requireAuth, async (req, res) => {
  try {
    const communityName = req.params.name;
    const userId = req.user.id;
    
    // Get community
    const communityQuery = 'SELECT id, name FROM communities WHERE name = $1';
    const communityResult = await pool.query(communityQuery, [communityName]);
    
    if (communityResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community not found'
      });
    }
    
    const community = communityResult.rows[0];
    
    // Check if already a member
    const memberQuery = 'SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2';
    const memberResult = await pool.query(memberQuery, [community.id, userId]);
    
    if (memberResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Already a member of this community'
      });
    }
    
    // Add member
    const joinQuery = `
      INSERT INTO community_members (community_id, user_id, role, joined_at)
      VALUES ($1, $2, 'member', NOW())
    `;
    
    await pool.query(joinQuery, [community.id, userId]);
    
    // Update member count
    await pool.query(
      'UPDATE communities SET member_count = member_count + 1 WHERE id = $1',
      [community.id]
    );
    
    // Notify community admins about new member
    try {
      const adminsQuery = `
        SELECT cm.user_id, u.username
        FROM community_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.community_id = $1 AND cm.role IN ('admin', 'moderator')
      `;
      const adminsResult = await pool.query(adminsQuery, [community.id]);
      
      for (const admin of adminsResult.rows) {
        if (admin.user_id !== userId) { // Don't notify yourself
          try {
            await createNotification({
              user_id: admin.user_id,
              type: 'comment', // Using 'comment' type for community activity
              title: 'New Community Member',
              message: `${req.user.username} joined r/${community.name}`,
              related_id: community.id,
              related_type: 'community'
            });
          } catch (notifErr) {
            console.error('Failed to create community join notification:', notifErr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to notify community admins:', err);
    }
    
    res.json({
      status: 'success',
      message: `Successfully joined r/${community.name}`
    });
  } catch (err) {
    console.error('Join community error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join community',
      error: err.message
    });
  }
});

// POST /api/communities/:name/leave - Leave a community
router.post('/:name/leave', authenticateToken, requireAuth, async (req, res) => {
  try {
    const communityName = req.params.name;
    const userId = req.user.id;
    
    // Get community
    const communityQuery = 'SELECT id, name FROM communities WHERE name = $1';
    const communityResult = await pool.query(communityQuery, [communityName]);
    
    if (communityResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community not found'
      });
    }
    
    const community = communityResult.rows[0];
    
    // Check if creator is trying to leave
    const creatorQuery = 'SELECT created_by FROM communities WHERE id = $1';
    const creatorResult = await pool.query(creatorQuery, [community.id]);
    
    if (creatorResult.rows[0].created_by === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Community creator cannot leave. Transfer ownership or delete the community.'
      });
    }
    
    // Remove member
    const leaveQuery = 'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2';
    const leaveResult = await pool.query(leaveQuery, [community.id, userId]);
    
    if (leaveResult.rowCount === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Not a member of this community'
      });
    }
    
    // Update member count
    await pool.query(
      'UPDATE communities SET member_count = member_count - 1 WHERE id = $1',
      [community.id]
    );
    
    res.json({
      status: 'success',
      message: `Successfully left r/${community.name}`
    });
  } catch (err) {
    console.error('Leave community error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave community',
      error: err.message
    });
  }
});

// GET /api/communities/:name/posts - Get posts from a community
router.get('/:name/posts', async (req, res) => {
  try {
    const communityName = req.params.name;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get community
    const communityQuery = 'SELECT id, name FROM communities WHERE name = $1';
    const communityResult = await pool.query(communityQuery, [communityName]);
    
    if (communityResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community not found'
      });
    }
    
    const community = communityResult.rows[0];
    
    // Get posts from community
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.upvotes,
        p.downvotes,
        p.user_id,
        p.view_count,
        p.answer_count,
        p.is_answered,
        p.status,
        p.tags,
        p.created,
        p.updated_at,
        u.username,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.community_id = $1
      ORDER BY p.created DESC
      LIMIT $2 OFFSET $3
    `;
    
    const { rows } = await pool.query(postsQuery, [community.id, limit, offset]);
    
    res.json({
      status: 'success',
      community: community.name,
      posts: rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get community posts error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch community posts',
      error: err.message
    });
  }
});

// GET /api/communities/user/subscribed - Get user's subscribed communities
router.get('/user/subscribed', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.member_count,
        c.post_count,
        c.is_public,
        c.created_at,
        cm.role,
        cm.joined_at
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id
      WHERE cm.user_id = $1
      ORDER BY cm.joined_at DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    res.json({
      status: 'success',
      communities: rows
    });
  } catch (err) {
    console.error('Get user communities error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user communities',
      error: err.message
    });
  }
});

// ===== MODERATION ENDPOINTS =====

// POST /api/communities/:name/ban - Ban a user from community
router.post('/:name/ban', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const { user_id, reason, duration_days } = req.body;
    const communityId = req.community.id;
    const moderatorId = req.user.id;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Check if user is already banned
    const existingBan = await pool.query(
      'SELECT id FROM community_bans WHERE community_id = $1 AND user_id = $2',
      [communityId, user_id]
    );
    
    if (existingBan.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already banned from this community'
      });
    }
    
    // Calculate expiration date
    let expiresAt = null;
    if (duration_days && duration_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration_days);
    }
    
    // Ban the user
    const banQuery = `
      INSERT INTO community_bans (community_id, user_id, banned_by, reason, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const banResult = await pool.query(banQuery, [
      communityId, user_id, moderatorId, reason || null, expiresAt
    ]);
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id, reason)
      VALUES ($1, $2, 'ban', $3, $4)
    `, [communityId, moderatorId, user_id, reason]);
    
    // Notify the banned user
    try {
      await createNotification({
        user_id: user_id,
        type: 'comment', // Using 'comment' type for moderation actions
        title: 'You were banned',
        message: `You were banned from r/${req.community.name}${reason ? `: ${reason}` : ''}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create ban notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'User banned successfully',
      ban: {
        user_id,
        reason,
        expires_at: expiresAt,
        is_permanent: expiresAt === null
      }
    });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to ban user',
      error: err.message
    });
  }
});

// POST /api/communities/:name/unban - Unban a user from community
router.post('/:name/unban', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const { user_id } = req.body;
    const communityId = req.community.id;
    const moderatorId = req.user.id;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Remove the ban
    const unbanResult = await pool.query(
      'DELETE FROM community_bans WHERE community_id = $1 AND user_id = $2',
      [communityId, user_id]
    );
    
    if (unbanResult.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User is not banned from this community'
      });
    }
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id)
      VALUES ($1, $2, 'unban', $3)
    `, [communityId, moderatorId, user_id]);
    
    // Notify the unbanned user
    try {
      await createNotification({
        user_id: user_id,
        type: 'comment', // Using 'comment' type for moderation actions
        title: 'You were unbanned',
        message: `You were unbanned from r/${req.community.name}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create unban notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'User unbanned successfully'
    });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unban user',
      error: err.message
    });
  }
});

// DELETE /api/communities/:name/posts/:postId - Delete a post (moderator only)
router.delete('/:name/posts/:postId', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const postId = req.params.postId;
    const communityId = req.community.id;
    const moderatorId = req.user.id;
    
    // Check if post belongs to this community
    const postQuery = `
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = $1 AND p.community_id = $2
    `;
    
    const postResult = await pool.query(postQuery, [postId, communityId]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found in this community'
      });
    }
    
    const post = postResult.rows[0];
    
    // Delete the post (cascade will handle comments)
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id, target_post_id)
      VALUES ($1, $2, 'delete_post', $3, $4)
    `, [communityId, moderatorId, post.user_id, postId]);
    
    // Notify the post owner about deletion
    try {
      await createNotification({
        user_id: post.user_id,
        type: 'comment', // Using 'comment' type for moderation actions
        title: 'Post Deleted',
        message: `Your post "${post.title}" was deleted by a moderator in r/${req.community.name}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create post deletion notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete post',
      error: err.message
    });
  }
});

// DELETE /api/communities/:name/comments/:commentId - Delete a comment (moderator only)
router.delete('/:name/comments/:commentId', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const communityId = req.community.id;
    const moderatorId = req.user.id;
    
    // Check if comment belongs to a post in this community
    const commentQuery = `
      SELECT c.*, u.username, p.community_id
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      JOIN posts p ON c.post_id = p.id
      WHERE c.id = $1 AND p.community_id = $2
    `;
    
    const commentResult = await pool.query(commentQuery, [commentId, communityId]);
    
    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found in this community'
      });
    }
    
    const comment = commentResult.rows[0];
    
    // Delete the comment
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id, target_comment_id)
      VALUES ($1, $2, 'delete_comment', $3, $4)
    `, [communityId, moderatorId, comment.user_id, commentId]);
    
    // Notify the comment owner about deletion
    try {
      await createNotification({
        user_id: comment.user_id,
        type: 'comment', // Using 'comment' type for moderation actions
        title: 'Comment Deleted',
        message: `Your comment was deleted by a moderator in r/${req.community.name}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create comment deletion notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment',
      error: err.message
    });
  }
});

// POST /api/communities/:name/promote - Promote user to moderator (admin only)
router.post('/:name/promote', authenticateToken, requireAuth, isAdmin, async (req, res) => {
  try {
    const { user_id } = req.body;
    const communityId = req.community.id;
    const adminId = req.user.id;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Check if user is a member
    const memberQuery = 'SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2';
    const memberResult = await pool.query(memberQuery, [communityId, user_id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a member of this community'
      });
    }
    
    const currentRole = memberResult.rows[0].role;
    
    if (currentRole === 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'User is already an admin'
      });
    }
    
    if (currentRole === 'moderator') {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a moderator'
      });
    }
    
    // Promote to moderator
    await pool.query(
      'UPDATE community_members SET role = $1 WHERE community_id = $2 AND user_id = $3',
      ['moderator', communityId, user_id]
    );
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id)
      VALUES ($1, $2, 'promote_mod', $3)
    `, [communityId, adminId, user_id]);
    
    // Notify the promoted user
    try {
      await createNotification({
        user_id: user_id,
        type: 'comment', // Using 'comment' type for community activity
        title: 'Promoted to Moderator',
        message: `You were promoted to moderator in r/${req.community.name}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create promotion notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'User promoted to moderator successfully'
    });
  } catch (err) {
    console.error('Promote user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to promote user',
      error: err.message
    });
  }
});

// POST /api/communities/:name/demote - Demote moderator to member (admin only)
router.post('/:name/demote', authenticateToken, requireAuth, isAdmin, async (req, res) => {
  try {
    const { user_id } = req.body;
    const communityId = req.community.id;
    const adminId = req.user.id;
    
    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // Check if user is a moderator
    const memberQuery = 'SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2';
    const memberResult = await pool.query(memberQuery, [communityId, user_id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a member of this community'
      });
    }
    
    const currentRole = memberResult.rows[0].role;
    
    if (currentRole !== 'moderator') {
      return res.status(400).json({
        status: 'error',
        message: 'User is not a moderator'
      });
    }
    
    // Demote to member
    await pool.query(
      'UPDATE community_members SET role = $1 WHERE community_id = $2 AND user_id = $3',
      ['member', communityId, user_id]
    );
    
    // Log the action
    await pool.query(`
      INSERT INTO moderation_log (community_id, moderator_id, action_type, target_user_id)
      VALUES ($1, $2, 'demote_mod', $3)
    `, [communityId, adminId, user_id]);
    
    // Notify the demoted user
    try {
      await createNotification({
        user_id: user_id,
        type: 'comment', // Using 'comment' type for community activity
        title: 'Demoted to Member',
        message: `You were demoted to member in r/${req.community.name}`,
        related_id: communityId,
        related_type: 'community'
      });
    } catch (notifErr) {
      console.error('Failed to create demotion notification:', notifErr);
    }
    
    res.json({
      status: 'success',
      message: 'User demoted to member successfully'
    });
  } catch (err) {
    console.error('Demote user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to demote user',
      error: err.message
    });
  }
});

// GET /api/communities/:name/bans - Get banned users (moderator only)
router.get('/:name/bans', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const communityId = req.community.id;
    
    const query = `
      SELECT cb.*, u.username, u.email, b.username as banned_by_username
      FROM community_bans cb
      JOIN users u ON cb.user_id = u.id
      JOIN users b ON cb.banned_by = b.id
      WHERE cb.community_id = $1
      AND (cb.expires_at IS NULL OR cb.expires_at > NOW())
      ORDER BY cb.banned_at DESC
    `;
    
    const result = await pool.query(query, [communityId]);
    
    res.json({
      status: 'success',
      bans: result.rows
    });
  } catch (err) {
    console.error('Get bans error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch banned users',
      error: err.message
    });
  }
});

// GET /api/communities/:name/moderation-log - Get moderation log (moderator only)
router.get('/:name/moderation-log', authenticateToken, requireAuth, isModerator, async (req, res) => {
  try {
    const communityId = req.community.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT ml.*, 
             m.username as moderator_username,
             t.username as target_username
      FROM moderation_log ml
      JOIN users m ON ml.moderator_id = m.id
      LEFT JOIN users t ON ml.target_user_id = t.id
      WHERE ml.community_id = $1
      ORDER BY ml.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [communityId, limit, offset]);
    
    res.json({
      status: 'success',
      logs: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Get moderation log error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch moderation log',
      error: err.message
    });
  }
});

module.exports = router; 