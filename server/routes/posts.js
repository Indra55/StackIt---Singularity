const express = require("express");
const router = express.Router();
const  pool  = require("../config/dbConfig");
const { checkAuthenticated, checkNotAuthenticated } = require("../middleware/auth");

router.get("/posts", checkNotAuthenticated, async (req, res) => {
  try {
    const query = `
      SELECT 
        posts.id,
        posts.content,
        posts.upvotes,
        posts.downvotes,
        posts.user_id,
        posts.created,
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


router.post("/posts/:id/upvote", checkNotAuthenticated, async (req, res) => {
  const postID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND post_id=$2",
      [userID, postID]
    );

    if (existingVoteRes.rowCount === 0) {
      await pool.query("INSERT INTO post_votes(user_id, post_id, vote_type) VALUES ($1, $2, 'upvote')", [userID, postID]);

      await pool.query("UPDATE posts SET upvotes = upvotes + 1 WHERE id=$1", [postID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "upvote") {
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND post_id=$2", [userID, postID]);

        await pool.query("UPDATE posts SET upvotes = upvotes - 1 WHERE id=$1 AND upvotes > 0", [postID]);
      } else {
        await pool.query("UPDATE post_votes SET vote_type='upvote' WHERE user_id=$1 AND post_id=$2", [userID, postID]);

        await pool.query(
          "UPDATE posts SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id=$1 AND downvotes > 0",
          [postID]
        );
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

router.post("/posts/:id/downvote", checkNotAuthenticated, async (req, res) => {
  const postID = req.params.id;
  const userID = req.user.id; 

  try {
    const existingVoteRes = await pool.query(
      "SELECT vote_type FROM post_votes WHERE user_id=$1 AND post_id=$2",
      [userID, postID]
    );

    if (existingVoteRes.rowCount === 0) {
      await pool.query("INSERT INTO post_votes(user_id, post_id, vote_type) VALUES ($1, $2, 'downvote')", [userID, postID]);

      await pool.query("UPDATE posts SET downvotes = downvotes + 1 WHERE id=$1", [postID]);
    } else {
      const existingVote = existingVoteRes.rows[0].vote_type;

      if (existingVote === "downvote") {
        
        await pool.query("DELETE FROM post_votes WHERE user_id=$1 AND post_id=$2", [userID, postID]);

        await pool.query("UPDATE posts SET downvotes = downvotes - 1 WHERE id=$1 AND downvotes > 0", [postID]);
      } else {

        await pool.query("UPDATE post_votes SET vote_type='downvote' WHERE user_id=$1 AND post_id=$2", [userID, postID]);

        await pool.query(
          "UPDATE posts SET downvotes = downvotes + 1, upvotes = upvotes - 1 WHERE id=$1 AND upvotes > 0",
          [postID]
        );
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



router.get("/posts/:id", checkNotAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;  

  try {
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
      ORDER BY comments.created_at ASC
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

router.get("/posts/:id/comments", (req, res) => {
    const postID = req.params.id;
    const query = `
      SELECT comments.*, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE post_id = $1
      ORDER BY comments.created_at ASC
    `;
    pool.query(query, [postID], (err, result) => {
        if(err){
            console.error(err);
            return res.status(500).json({
              message: "Cannot fetch comments",
              status: "error",
              error: err.message
            });
        }
        res.json({
          message: "Comments retrieved successfully",
          status: "success",
          comments: result.rows,
          postId: postID
        });
    });
});

router.post("/posts/:id/comment", checkNotAuthenticated, (req, res) => {
    const postID = req.params.id;
    const userID = req.user.id;
    const content = req.body.content;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        message: "Comment content is required",
        status: "error"
      });
    }

    const query = `
        INSERT INTO COMMENTS (post_id,user_id,content)
        VALUES ($1, $2, $3) RETURNING id, created_at
    `;
    pool.query(query, [postID, userID, content], (err, result) => {
        if(err){
            console.error(err);
            return res.status(500).json({
              message: "Cannot add comment",
              status: "error",
              error: err.message
            });
        }
        res.json({
          message: "Comment added successfully",
          status: "success",
          comment: {
            id: result.rows[0].id,
            content,
            user_id: userID,
            post_id: postID,
            created_at: result.rows[0].created_at
          }
        });
    });
});

router.post("/posts/create", checkNotAuthenticated, (req, res) => {
    const {content} = req.body;
    const userID = req.user.id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        message: "Post content is required",
        status: "error"
      });
    }

    const query = `
        INSERT INTO posts(content,user_id)
        VALUES ($1 , $2) RETURNING id, created
    `;

    pool.query(query, [content, userID], (err, result) => {
        if(err){
            console.error(err);
            return res.status(500).json({
              message: "Cannot create post",
              status: "error",
              error: err.message
            });
        }
        res.json({
          message: "Post created successfully",
          status: "success",
          post: {
            id: result.rows[0].id,
            content,
            user_id: userID,
            created: result.rows[0].created
          }
        });
    });
});

module.exports = router;
