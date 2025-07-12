const express = require("express");
const router = express.Router();
const pool = require("../config/dbConfig");
const { authenticateToken, requireAuth } = require("../middleware/auth");
const { processMentions } = require("./mentionRoutes");

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const query = `
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.upvotes,
        posts.downvotes,
        posts.user_id,
        posts.view_count,
        posts.answer_count,
        posts.is_answered,
        posts.status,
        posts.tags,
        posts.created,
        posts.updated_at,
        users.username,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created DESC;
    `;

    const { rows } = await pool.query(query);

    res.json({
      message: "Posts retrieved successfully",
      status: "success",
      posts: rows
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Cannot fetch posts",
      status: "error",
      error: err.message
    });
  }
});

// Get posts
router.get("/posts/tag/:tag", async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase();
    
    const query = `
      SELECT 
        posts.id,
        posts.title,
        posts.content,
        posts.upvotes,
        posts.downvotes,
        posts.user_id,
        posts.view_count,
        posts.answer_count,
        posts.is_answered,
        posts.status,
        posts.tags,
        posts.created,
        posts.updated_at,
        users.username,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE $1 = ANY(posts.tags)
      ORDER BY posts.created DESC;
    `;

    const { rows } = await pool.query(query, [tag]);

    res.json({
      message: `Posts with tag '${tag}' retrieved successfully`,
      status: "success",
      posts: rows,
      tag: tag
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Cannot fetch posts by tag",
      status: "error",
      error: err.message
    });
  }
});

// Get all unique tags
router.get("/tags", async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT unnest(tags) as tag, COUNT(*) as count
      FROM posts
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      GROUP BY tag
      ORDER BY count DESC, tag ASC;
    `;

    const { rows } = await pool.query(query);

    res.json({
      message: "Tags retrieved successfully",
      status: "success",
      tags: rows
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Cannot fetch tags",
      status: "error",
      error: err.message
    });
  }
});

// Create a new post
router.post("/posts/create", authenticateToken, requireAuth, async (req, res) => {
  const { title, content, tags, community_name } = req.body;
  const userID = req.user.id;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      message: "Post title is required",
      status: "error"
    });
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({
      message: "Post content is required",
      status: "error"
    });
  }

  // Validate and process tags
  let processedTags = [];
  if (tags && Array.isArray(tags)) {
    // Use database function to validate tags
    const validationQuery = 'SELECT validate_tags($1) as valid_tags';
    const validationResult = await pool.query(validationQuery, [tags]);
    processedTags = validationResult.rows[0].valid_tags || [];
  }
  
  console.log('Original tags:', tags);
  console.log('Processed tags:', processedTags);

  // Handle community association
  let communityId = null;
  if (community_name) {
    const communityQuery = 'SELECT id FROM communities WHERE name = $1';
    const communityResult = await pool.query(communityQuery, [community_name.toLowerCase()]);
    
    if (communityResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: `Community '${community_name}' not found`
      });
    }
    
    communityId = communityResult.rows[0].id;
    
    // Check if user is a member of the community
    const memberQuery = 'SELECT id FROM community_members WHERE community_id = $1 AND user_id = $2';
    const memberResult = await pool.query(memberQuery, [communityId, userID]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be a member of the community to post there'
      });
    }
    
    // Check if user is banned from the community
    const banQuery = `
      SELECT id FROM community_bans 
      WHERE community_id = $1 AND user_id = $2 
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const banResult = await pool.query(banQuery, [communityId, userID]);
    
    if (banResult.rows.length > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You are banned from this community and cannot post'
      });
    }
  }

  try {
    const query = `
      INSERT INTO posts(title, content, user_id, view_count, upvotes, downvotes, answer_count, is_answered, status, tags, community_id, created, updated_at)
      VALUES ($1, $2, $3, 0, 0, 0, 0, false, 'open', $4, $5, NOW(), NOW()) 
      RETURNING id, title, content, user_id, tags, community_id, created, updated_at
    `;

    const result = await pool.query(query, [title, content, userID, processedTags, communityId]);
    const postId = result.rows[0].id;

    // Process mentions in the post
    const mentionResult = await processMentions({
        postId: postId,
        mentionerUserId: userID,
        content
    });

    res.json({
      message: "Post created successfully",
      status: "success",
      post: result.rows[0],
      mentions: mentionResult.mentions || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot create post",
      status: "error",
      error: err.message
    });
  }
});

// Get a specific post with comments
router.get("/posts/:id", authenticateToken, requireAuth, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;  

  try {
    // Increment view count
    await pool.query("UPDATE posts SET view_count = view_count + 1 WHERE id = $1", [postId]);

    const postQuery = `
      SELECT posts.*, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = $1
    `;
    const commentQuery = `
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE post_id = $1
      ORDER BY comments.is_accepted DESC, comments.upvotes DESC, comments.created_at ASC
    `;
    const postResult = await pool.query(postQuery, [postId]);
    const commentsResult = await pool.query(commentQuery, [postId]);

    const voteQuery = `
      SELECT vote_type
      FROM post_votes
      WHERE post_id = $1 AND user_id = $2
    `;
    const voteResult = await pool.query(voteQuery, [postId, userId]);

    const userVote = voteResult.rows.length > 0 ? voteResult.rows[0].vote_type : null;

    res.json({
      message: "Post retrieved successfully",
      status: "success",
      post: postResult.rows[0],
      comments: commentsResult.rows,
      userVote
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      status: "error",
      error: err.message
    });
  }
});

// Get comments for a post
router.get("/posts/:id/comments", async (req, res) => {
  const postID = req.params.id;
  
  try {
    const query = `
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE post_id = $1
      ORDER BY comments.is_accepted DESC, comments.upvotes DESC, comments.created_at ASC
    `;
    
    const result = await pool.query(query, [postID]);
    
    res.json({
      message: "Comments retrieved successfully",
      status: "success",
      comments: result.rows,
      postId: postID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot fetch comments",
      status: "error",
      error: err.message
    });
  }
});

// Add a comment to a post
router.post("/posts/:id/comment", authenticateToken, requireAuth, async (req, res) => {
  const postID = req.params.id;
  const userID = req.user.id;
  const content = req.body.content;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({
      message: "Comment content is required",
      status: "error"
    });
  }

  try {
    // Check if post exists and get community info
    const postQuery = `
      SELECT p.*, c.name as community_name 
      FROM posts p 
      LEFT JOIN communities c ON p.community_id = c.id 
      WHERE p.id = $1
    `;
    const postResult = await pool.query(postQuery, [postID]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
        status: "error"
      });
    }
    
    const post = postResult.rows[0];
    
    // If post is in a community, check if user is banned
    if (post.community_id) {
      const banQuery = `
        SELECT id FROM community_bans 
        WHERE community_id = $1 AND user_id = $2 
        AND (expires_at IS NULL OR expires_at > NOW())
      `;
      const banResult = await pool.query(banQuery, [post.community_id, userID]);
      
      if (banResult.rows.length > 0) {
        return res.status(403).json({
          message: "You are banned from this community and cannot comment",
          status: "error"
        });
      }
    }

    const query = `
      INSERT INTO comments (post_id, user_id, content, upvotes, downvotes, is_accepted, created_at, updated_at)
      VALUES ($1, $2, $3, 0, 0, false, NOW(), NOW()) 
      RETURNING id, content, user_id, post_id, created_at, updated_at
    `;
    
    const result = await pool.query(query, [postID, userID, content]);
    const commentId = result.rows[0].id;

    // Process mentions in the comment
    const mentionResult = await processMentions({
        postId: postID,
        commentId: commentId,
        mentionerUserId: userID,
        content
    });

    // Note: answer_count is automatically updated by the database trigger

    res.json({
      message: "Comment added successfully",
      status: "success",
      comment: result.rows[0],
      mentions: mentionResult.mentions || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot add comment",
      status: "error",
      error: err.message
    });
  }
});

// Accept an answer (mark comment as accepted)
router.post("/posts/:postId/accept-answer/:commentId", authenticateToken, requireAuth, async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const userId = req.user.id;

  try {
    // Check if user owns the post
    const postCheck = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
        status: "error"
      });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        message: "Only the post owner can accept answers",
        status: "error"
      });
    }

    // Check if comment exists and belongs to the post
    const commentCheck = await pool.query("SELECT id FROM comments WHERE id = $1 AND post_id = $2", [commentId, postId]);
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found or doesn't belong to this post",
        status: "error"
      });
    }

    // Update the comment as accepted
    await pool.query("UPDATE comments SET is_accepted = true WHERE id = $1", [commentId]);

    // Update the post as answered
    await pool.query("UPDATE posts SET is_answered = true, accepted_answer_id = $1 WHERE id = $2", [commentId, postId]);

    res.json({
      message: "Answer accepted successfully",
      status: "success"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot accept answer",
      status: "error",
      error: err.message
    });
  }
});

// Upvote a post
router.post("/posts/:id/upvote", authenticateToken, requireAuth, async (req, res) => {
  const postID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND post_id=$2",
      [userID, postID]
    );

    if (existingVoteRes.rowCount === 0) {
      // Insert new upvote - trigger will handle vote count update
      await pool.query("INSERT INTO post_votes(user_id, post_id, vote_type) VALUES ($1, $2, 'up')", [userID, postID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "up") {
        // Remove upvote - trigger will handle vote count update
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND post_id=$2", [userID, postID]);
      } else {
        // Change from downvote to upvote - trigger will handle vote count update
        await pool.query("UPDATE post_votes SET vote_type='up' WHERE user_id=$1 AND post_id=$2", [userID, postID]);
      }
    }

    // Get updated post data
    const updatedPost = await pool.query(
      "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
      [postID]
    );

    res.json({
      message: "Upvote successful",
      status: "success",
      post: updatedPost.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot Upvote Post",
      status: "error",
      error: err.message
    });
  }
});

// Downvote a post
router.post("/posts/:id/downvote", authenticateToken, requireAuth, async (req, res) => {
  const postID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND post_id=$2",
      [userID, postID]
    );

    if (existingVoteRes.rowCount === 0) {
      // Insert new downvote - trigger will handle vote count update
      await pool.query("INSERT INTO post_votes(user_id, post_id, vote_type) VALUES ($1, $2, 'down')", [userID, postID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "down") {
        // Remove downvote - trigger will handle vote count update
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND post_id=$2", [userID, postID]);
      } else {
        // Change from upvote to downvote - trigger will handle vote count update
        await pool.query("UPDATE post_votes SET vote_type='down' WHERE user_id=$1 AND post_id=$2", [userID, postID]);
      }
    }

    // Get updated post data
    const updatedPost = await pool.query(
      "SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
      [postID]
    );

    res.json({
      message: "Downvote successful",
      status: "success",
      post: updatedPost.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot Downvote Post",
      status: "error",
      error: err.message
    });
  }
});

// Upvote a comment
router.post("/comments/:id/upvote", authenticateToken, requireAuth, async (req, res) => {
  const commentID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND comment_id=$2",
      [userID, commentID]
    );

    if (existingVoteRes.rowCount === 0) {
      // Insert new upvote - trigger will handle vote count update
      await pool.query("INSERT INTO post_votes(user_id, comment_id, vote_type) VALUES ($1, $2, 'up')", [userID, commentID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "up") {
        // Remove upvote - trigger will handle vote count update
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND comment_id=$2", [userID, commentID]);
      } else {
        // Change from downvote to upvote - trigger will handle vote count update
        await pool.query("UPDATE post_votes SET vote_type='up' WHERE user_id=$1 AND comment_id=$2", [userID, commentID]);
      }
    }

    // Get updated comment data
    const updatedComment = await pool.query(
      "SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = $1",
      [commentID]
    );

    res.json({
      message: "Comment upvote successful",
      status: "success",
      comment: updatedComment.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot upvote comment",
      status: "error",
      error: err.message
    });
  }
});

// Downvote a comment
router.post("/comments/:id/downvote", authenticateToken, requireAuth, async (req, res) => {
  const commentID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND comment_id=$2",
      [userID, commentID]
    );

    if (existingVoteRes.rowCount === 0) {
      // Insert new downvote - trigger will handle vote count update
      await pool.query("INSERT INTO post_votes(user_id, comment_id, vote_type) VALUES ($1, $2, 'down')", [userID, commentID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "down") {
        // Remove downvote - trigger will handle vote count update
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND comment_id=$2", [userID, commentID]);
      } else {
        // Change from upvote to downvote - trigger will handle vote count update
        await pool.query("UPDATE post_votes SET vote_type='down' WHERE user_id=$1 AND comment_id=$2", [userID, commentID]);
      }
    }

    // Get updated comment data
    const updatedComment = await pool.query(
      "SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = $1",
      [commentID]
    );

    res.json({
      message: "Comment downvote successful",
      status: "success",
      comment: updatedComment.rows[0]
    });
  } catch (err) {
            console.error(err);
    res.status(500).json({
      message: "Cannot downvote comment",
              status: "error",
              error: err.message
            });
        }
});

// Update post status
router.put("/posts/:id/status", authenticateToken, requireAuth, async (req, res) => {
  const postId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  if (!status || !['open', 'closed', 'duplicate', 'off-topic'].includes(status)) {
      return res.status(400).json({
      message: "Invalid status. Must be one of: open, closed, duplicate, off-topic",
      status: "error"
    });
  }

  try {
    // Check if user owns the post or is admin
    const postCheck = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
        status: "error"
      });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        message: "Only the post owner can update status",
        status: "error"
      });
    }

    await pool.query("UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2", [status, postId]);

    res.json({
      message: "Post status updated successfully",
      status: "success"
    });
  } catch (err) {
            console.error(err);
    res.status(500).json({
      message: "Cannot update post status",
              status: "error",
              error: err.message
            });
        }
});

module.exports = router;
