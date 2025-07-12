const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');

// Helper function to escape SQL LIKE patterns
const escapeLikePattern = (str) => {
    return str.replace(/[%_]/g, '\\$&');
};

// Helper function to build search query with pagination
const buildSearchQuery = (baseQuery, params, limit = 10, offset = 0) => {
    return {
        text: baseQuery + ' ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        values: [...params, limit, offset]
    };
};

// Main search endpoint - searches across all types
router.get('/', async (req, res) => {
    try {
        const { q: query, limit = 10, offset = 0 } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        const results = {};

        // Search posts
        const postsQuery = `
            SELECT p.*, u.username, u.avatar_url,
                   array_length(p.tags, 1) as tag_count
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE (p.title ILIKE $1 OR p.content ILIKE $1 OR p.tags::text ILIKE $1)
            ORDER BY p.created DESC
            LIMIT $2 OFFSET $3
        `;
        
        const postsResult = await pool.query(postsQuery, [searchTerm, limit, offset]);
        results.posts = postsResult.rows;

        // Search comments
        const commentsQuery = `
            SELECT c.*, u.username, u.avatar_url, p.title as post_title
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN posts p ON c.post_id = p.id
            WHERE c.content ILIKE $1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const commentsResult = await pool.query(commentsQuery, [searchTerm, limit, offset]);
        results.comments = commentsResult.rows;

        // Search users
        const usersQuery = `
            SELECT id, username, first_name, last_name, bio, avatar_url, reputation, created_at
            FROM users
            WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR bio ILIKE $1)
            ORDER BY reputation DESC, created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const usersResult = await pool.query(usersQuery, [searchTerm, limit, offset]);
        results.users = usersResult.rows;

        // Search tags
        const tagsQuery = `
            SELECT *
            FROM tags
            WHERE (name ILIKE $1 OR description ILIKE $1)
            ORDER BY usage_count DESC, name ASC
            LIMIT $2 OFFSET $3
        `;
        
        const tagsResult = await pool.query(tagsQuery, [searchTerm, limit, offset]);
        results.tags = tagsResult.rows;

        res.json({
            success: true,
            data: results,
            query: query,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during search'
        });
    }
});

// Search posts specifically
router.get('/posts', async (req, res) => {
    try {
        const { q: query, limit = 10, offset = 0, sort = 'relevance' } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        let orderBy = 'p.created DESC';
        
        // Handle different sort options
        switch (sort) {
            case 'votes':
                orderBy = '(p.upvotes - p.downvotes) DESC, p.created DESC';
                break;
            case 'views':
                orderBy = 'p.view_count DESC, p.created DESC';
                break;
            case 'answers':
                orderBy = 'p.answer_count DESC, p.created DESC';
                break;
            case 'oldest':
                orderBy = 'p.created ASC';
                break;
            case 'newest':
                orderBy = 'p.created DESC';
                break;
            default:
                orderBy = 'p.created DESC';
        }

        const postsQuery = `
            SELECT p.*, u.username, u.avatar_url,
                   array_length(p.tags, 1) as tag_count,
                   (p.upvotes - p.downvotes) as score
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE (p.title ILIKE $1 OR p.content ILIKE $1 OR p.tags::text ILIKE $1)
            ORDER BY ${orderBy}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(postsQuery, [searchTerm, limit, offset]);
        
        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM posts p
            WHERE (p.title ILIKE $1 OR p.content ILIKE $1 OR p.tags::text ILIKE $1)
        `;
        
        const countResult = await pool.query(countQuery, [searchTerm]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            query: query,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            },
            sort: sort
        });

    } catch (error) {
        console.error('Posts search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during posts search'
        });
    }
});

// Search comments specifically
router.get('/comments', async (req, res) => {
    try {
        const { q: query, limit = 10, offset = 0, sort = 'newest' } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        let orderBy = 'c.created_at DESC';
        
        switch (sort) {
            case 'votes':
                orderBy = '(c.upvotes - c.downvotes) DESC, c.created_at DESC';
                break;
            case 'oldest':
                orderBy = 'c.created_at ASC';
                break;
            case 'newest':
                orderBy = 'c.created_at DESC';
                break;
            default:
                orderBy = 'c.created_at DESC';
        }

        const commentsQuery = `
            SELECT c.*, u.username, u.avatar_url, p.title as post_title, p.id as post_id,
                   (c.upvotes - c.downvotes) as score
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN posts p ON c.post_id = p.id
            WHERE c.content ILIKE $1
            ORDER BY ${orderBy}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(commentsQuery, [searchTerm, limit, offset]);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM comments c
            WHERE c.content ILIKE $1
        `;
        
        const countResult = await pool.query(countQuery, [searchTerm]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            query: query,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            },
            sort: sort
        });

    } catch (error) {
        console.error('Comments search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during comments search'
        });
    }
});

// Search users specifically
router.get('/users', async (req, res) => {
    try {
        const { q: query, limit = 10, offset = 0, sort = 'relevance' } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        let orderBy = 'reputation DESC, created_at DESC';
        
        switch (sort) {
            case 'reputation':
                orderBy = 'reputation DESC, created_at DESC';
                break;
            case 'newest':
                orderBy = 'created_at DESC';
                break;
            case 'oldest':
                orderBy = 'created_at ASC';
                break;
            case 'username':
                orderBy = 'username ASC';
                break;
            default:
                orderBy = 'reputation DESC, created_at DESC';
        }

        const usersQuery = `
            SELECT id, username, first_name, last_name, bio, avatar_url, 
                   reputation, created_at, is_online
            FROM users
            WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR bio ILIKE $1)
            ORDER BY ${orderBy}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(usersQuery, [searchTerm, limit, offset]);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users
            WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR bio ILIKE $1)
        `;
        
        const countResult = await pool.query(countQuery, [searchTerm]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            query: query,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            },
            sort: sort
        });

    } catch (error) {
        console.error('Users search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during users search'
        });
    }
});

// Search tags specifically
router.get('/tags', async (req, res) => {
    try {
        const { q: query, limit = 10, offset = 0, sort = 'usage' } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        let orderBy = 'usage_count DESC, name ASC';
        
        switch (sort) {
            case 'usage':
                orderBy = 'usage_count DESC, name ASC';
                break;
            case 'name':
                orderBy = 'name ASC';
                break;
            case 'newest':
                orderBy = 'created_at DESC';
                break;
            case 'oldest':
                orderBy = 'created_at ASC';
                break;
            default:
                orderBy = 'usage_count DESC, name ASC';
        }

        const tagsQuery = `
            SELECT *
            FROM tags
            WHERE (name ILIKE $1 OR description ILIKE $1)
            ORDER BY ${orderBy}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(tagsQuery, [searchTerm, limit, offset]);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM tags
            WHERE (name ILIKE $1 OR description ILIKE $1)
        `;
        
        const countResult = await pool.query(countQuery, [searchTerm]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            query: query,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                hasMore: (parseInt(offset) + parseInt(limit)) < total
            },
            sort: sort
        });

    } catch (error) {
        console.error('Tags search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during tags search'
        });
    }
});

// Advanced search with filters
router.get('/advanced', async (req, res) => {
    try {
        const { 
            q: query, 
            type = 'all', 
            limit = 10, 
            offset = 0,
            sort = 'relevance',
            tags,
            author,
            dateFrom,
            dateTo,
            hasAnswers,
            isAnswered
        } = req.query;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = `%${escapeLikePattern(query.trim())}%`;
        let baseQuery = '';
        let params = [searchTerm];
        let paramIndex = 1;

        // Build base query based on type
        if (type === 'posts' || type === 'all') {
            baseQuery = `
                SELECT p.*, u.username, u.avatar_url,
                       array_length(p.tags, 1) as tag_count,
                       (p.upvotes - p.downvotes) as score,
                       'post' as type
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE (p.title ILIKE $1 OR p.content ILIKE $1 OR p.tags::text ILIKE $1)
            `;

            // Add filters
            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim());
                paramIndex++;
                baseQuery += ` AND p.tags && $${paramIndex}`;
                params.push(tagArray);
            }

            if (author) {
                paramIndex++;
                baseQuery += ` AND u.username ILIKE $${paramIndex}`;
                params.push(`%${author}%`);
            }

            if (dateFrom) {
                paramIndex++;
                baseQuery += ` AND p.created >= $${paramIndex}`;
                params.push(dateFrom);
            }

            if (dateTo) {
                paramIndex++;
                baseQuery += ` AND p.created <= $${paramIndex}`;
                params.push(dateTo);
            }

            if (hasAnswers === 'true') {
                baseQuery += ` AND p.answer_count > 0`;
            }

            if (isAnswered === 'true') {
                baseQuery += ` AND p.is_answered = true`;
            } else if (isAnswered === 'false') {
                baseQuery += ` AND p.is_answered = false`;
            }
        }

        // Add sorting
        let orderBy = 'created DESC';
        switch (sort) {
            case 'votes':
                orderBy = 'score DESC, created DESC';
                break;
            case 'views':
                orderBy = 'view_count DESC, created DESC';
                break;
            case 'answers':
                orderBy = 'answer_count DESC, created DESC';
                break;
            case 'oldest':
                orderBy = 'created ASC';
                break;
            case 'newest':
                orderBy = 'created DESC';
                break;
            default:
                orderBy = 'created DESC';
        }

        baseQuery += ` ORDER BY ${orderBy} LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`;
        params.push(limit, offset);

        const result = await pool.query(baseQuery, params);

        res.json({
            success: true,
            data: result.rows,
            query: query,
            filters: {
                type,
                tags,
                author,
                dateFrom,
                dateTo,
                hasAnswers,
                isAnswered
            },
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            sort: sort
        });

    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during advanced search'
        });
    }
});

module.exports = router; 