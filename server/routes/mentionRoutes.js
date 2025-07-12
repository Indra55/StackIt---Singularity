const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Utility: Extract mentions from text using @ symbol
function extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]); // username without @
    }
    
    return [...new Set(mentions)]; // Remove duplicates
}

// Utility: Process mentions and create notifications
async function processMentions({ postId, commentId, mentionerUserId, content }) {
    try {
        // Extract usernames from content
        const mentionedUsernames = extractMentions(content);
        
        if (mentionedUsernames.length === 0) {
            return { success: true, mentions: [] };
        }

        // Get user IDs for mentioned usernames
        const usernamePlaceholders = mentionedUsernames.map((_, index) => `$${index + 1}`).join(',');
        const userQuery = `
            SELECT id, username, first_name, last_name 
            FROM users 
            WHERE username = ANY($1::text[])
        `;
        
        const userResult = await pool.query(userQuery, [mentionedUsernames]);
        const mentionedUsers = userResult.rows;

        if (mentionedUsers.length === 0) {
            return { success: true, mentions: [] };
        }

        // Get mentioner user info
        const mentionerQuery = `
            SELECT username, first_name, last_name 
            FROM users 
            WHERE id = $1
        `;
        const mentionerResult = await pool.query(mentionerQuery, [mentionerUserId]);
        const mentioner = mentionerResult.rows[0];

        // Insert mentions and create notifications
        const mentionPromises = mentionedUsers.map(async (user) => {
            // Insert mention record
            await pool.query(
                'INSERT INTO mentions (mentioned_user_id, mentioner_user_id, post_id, comment_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [user.id, mentionerUserId, postId || null, commentId || null]
            );

            // Create notification
            const notificationTitle = commentId ? 'New mention in comment' : 'New mention in post';
            const notificationMessage = `${mentioner.username} mentioned you in a ${commentId ? 'comment' : 'post'}`;
            
            await createNotification({
                user_id: user.id,
                type: 'mention',
                title: notificationTitle,
                message: notificationMessage,
                related_id: commentId || postId,
                related_type: commentId ? 'comment' : 'post'
            });
        });

        await Promise.all(mentionPromises);

        return {
            success: true,
            mentions: mentionedUsers.map(user => ({
                id: user.id,
                username: user.username,
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
            }))
        };
    } catch (error) {
        console.error('Error processing mentions:', error);
        return { success: false, error: error.message };
    }
}

// POST /api/mentions/process - Process mentions in content
router.post('/process', authenticateToken, requireAuth, async (req, res) => {
    const { postId, commentId, content } = req.body;

    if (!content || typeof content !== 'string') {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Content is required and must be a string' 
        });
    }

    try {
        const result = await processMentions({
            postId,
            commentId,
            mentionerUserId: req.user.id,
            content
        });

        if (result.success) {
            res.status(201).json({
                status: 'success',
                message: 'Mentions processed successfully',
                mentions: result.mentions
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Failed to process mentions',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error processing mentions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/mentions/users - Get users for autocomplete (for frontend)
router.get('/users', authenticateToken, requireAuth, async (req, res) => {
    const { query = '', limit = 10 } = req.query;

    try {
        let userQuery = `
            SELECT id, username, first_name, last_name, avatar_url
            FROM users 
            WHERE is_banned = false 
            AND id != $1
        `;
        const queryParams = [req.user.id];
        let paramIndex = 2;

        if (query.trim()) {
            userQuery += ` AND (
                username ILIKE $${paramIndex} OR 
                first_name ILIKE $${paramIndex} OR 
                last_name ILIKE $${paramIndex}
            )`;
            queryParams.push(`%${query}%`);
            paramIndex++;
        }

        userQuery += ` ORDER BY 
            CASE 
                WHEN username ILIKE $${paramIndex} THEN 1
                WHEN first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} THEN 2
                ELSE 3
            END,
            username ASC
            LIMIT $${paramIndex + 1}
        `;
        
        queryParams.push(`%${query}%`, parseInt(limit));

        const { rows } = await pool.query(userQuery, queryParams);

        const users = rows.map(user => ({
            id: user.id,
            username: user.username,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            avatar_url: user.avatar_url
        }));

        res.json({
            status: 'success',
            users
        });
    } catch (error) {
        console.error('Error fetching users for autocomplete:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// GET /api/mentions/:postId - Get mentions for a post
router.get('/:postId', authenticateToken, requireAuth, async (req, res) => {
    const { postId } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                m.*,
                u.username as mentioned_username,
                u.first_name,
                u.last_name,
                u.avatar_url
            FROM mentions m
            JOIN users u ON m.mentioned_user_id = u.id
            WHERE m.post_id = $1
            ORDER BY m.created_at DESC
        `, [postId]);

        const mentions = result.rows.map(mention => ({
            id: mention.id,
            mentioned_user: {
                id: mention.mentioned_user_id,
                username: mention.mentioned_username,
                name: `${mention.first_name || ''} ${mention.last_name || ''}`.trim() || mention.mentioned_username,
                avatar_url: mention.avatar_url
            },
            mentioner_user_id: mention.mentioner_user_id,
            post_id: mention.post_id,
            comment_id: mention.comment_id,
            created_at: mention.created_at
        }));

        res.json({
            status: 'success',
            mentions
        });
    } catch (error) {
        console.error('Error fetching mentions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch mentions',
            error: error.message
        });
    }
});

// GET /api/mentions/user/:userId - Get mentions for a specific user
router.get('/user/:userId', authenticateToken, requireAuth, async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(`
            SELECT 
                m.*,
                u.username as mentioner_username,
                u.first_name as mentioner_first_name,
                u.last_name as mentioner_last_name,
                u.avatar_url as mentioner_avatar_url,
                p.content as post_content,
                c.content as comment_content
            FROM mentions m
            JOIN users u ON m.mentioner_user_id = u.id
            LEFT JOIN posts p ON m.post_id = p.id
            LEFT JOIN comments c ON m.comment_id = c.id
            WHERE m.mentioned_user_id = $1
            ORDER BY m.created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        const mentions = result.rows.map(mention => ({
            id: mention.id,
            mentioner: {
                id: mention.mentioner_user_id,
                username: mention.mentioner_username,
                name: `${mention.mentioner_first_name || ''} ${mention.mentioner_last_name || ''}`.trim() || mention.mentioner_username,
                avatar_url: mention.mentioner_avatar_url
            },
            post_id: mention.post_id,
            comment_id: mention.comment_id,
            post_content: mention.post_content,
            comment_content: mention.comment_content,
            created_at: mention.created_at
        }));

        res.json({
            status: 'success',
            mentions,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching user mentions:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch user mentions',
            error: error.message
        });
    }
});

module.exports = router;
module.exports.processMentions = processMentions;
module.exports.extractMentions = extractMentions; 