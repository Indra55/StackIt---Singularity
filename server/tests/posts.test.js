const request = require('supertest');
const express = require('express');
const app = require('../server');
const pool = require('../config/dbConfig');

// Test data
let authToken;
let testUserId;
let testPostId;
let testCommentId;
let testUser2Id;
let authToken2;

describe('Posts API Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM post_votes WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM users WHERE email LIKE \'%test%\'');

    // Create test user 1
    const user1Response = await request(app)
      .post('/users/register')
      .send({
        username: 'testuser1',
        email: 'test1@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User1'
      });

    testUserId = user1Response.body.user.id;

    // Login user 1
    const login1Response = await request(app)
      .post('/users/login')
      .send({
        email: 'test1@example.com',
        password: 'password123'
      });

    authToken = login1Response.body.token;

    // Create test user 2
    const user2Response = await request(app)
      .post('/users/register')
      .send({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User2'
      });

    testUser2Id = user2Response.body.user.id;

    // Login user 2
    const login2Response = await request(app)
      .post('/users/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });

    authToken2 = login2Response.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM post_votes WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE email LIKE \'%test%\')');
    await pool.query('DELETE FROM users WHERE email LIKE \'%test%\'');
    await pool.end();
  });

  describe('GET /posts', () => {
    it('should get all posts', async () => {
      const response = await request(app)
        .get('/posts')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Posts retrieved successfully');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });
  });

  describe('POST /posts/create', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content'
      };

      const response = await request(app)
        .post('/posts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.post).toHaveProperty('id');
      expect(response.body.post.title).toBe(postData.title);
      expect(response.body.post.content).toBe(postData.content);
      expect(response.body.post.user_id).toBe(testUserId);

      testPostId = response.body.post.id;
    });

    it('should fail to create post without title', async () => {
      const postData = {
        content: 'This is a test post content'
      };

      const response = await request(app)
        .post('/posts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Post title is required');
    });

    it('should fail to create post without content', async () => {
      const postData = {
        title: 'Test Post Title'
      };

      const response = await request(app)
        .post('/posts/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Post content is required');
    });

    it('should fail to create post without authentication', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content'
      };

      const response = await request(app)
        .post('/posts/create')
        .send(postData)
        .expect(401);
    });
  });

  describe('GET /posts/:id', () => {
    it('should get a specific post with comments', async () => {
      const response = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post retrieved successfully');
      expect(response.body.post).toHaveProperty('id', testPostId);
      expect(response.body.post).toHaveProperty('title');
      expect(response.body.post).toHaveProperty('content');
      expect(response.body.post).toHaveProperty('view_count');
      expect(response.body.post).toHaveProperty('upvotes');
      expect(response.body.post).toHaveProperty('downvotes');
      expect(response.body.post).toHaveProperty('answer_count');
      expect(response.body.post).toHaveProperty('is_answered');
      expect(response.body.post).toHaveProperty('status');
      expect(response.body.post).toHaveProperty('username');
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body).toHaveProperty('userVote');
    });

    it('should increment view count when post is viewed', async () => {
      // Get initial view count
      const initialResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialViewCount = initialResponse.body.post.view_count;

      // View the post again
      const response = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.post.view_count).toBe(initialViewCount + 1);
    });

    it('should fail to get non-existent post', async () => {
      const response = await request(app)
        .get('/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);
    });
  });

  describe('POST /posts/:id/comment', () => {
    it('should add a comment to a post', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/posts/${testPostId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Comment added successfully');
      expect(response.body.comment).toHaveProperty('id');
      expect(response.body.comment.content).toBe(commentData.content);
      expect(response.body.comment.user_id).toBe(testUserId);
      expect(response.body.comment.post_id).toBe(testPostId);

      testCommentId = response.body.comment.id;
    });

    it('should fail to add comment without content', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Comment content is required');
    });

    it('should fail to add comment without authentication', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/posts/${testPostId}/comment`)
        .send(commentData)
        .expect(401);
    });
  });

  describe('GET /posts/:id/comments', () => {
    it('should get comments for a post', async () => {
      const response = await request(app)
        .get(`/posts/${testPostId}/comments`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Comments retrieved successfully');
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.postId).toBe(testPostId);
      expect(response.body.comments.length).toBeGreaterThan(0);
    });
  });

  describe('POST /posts/:id/upvote', () => {
    it('should upvote a post', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Upvote successful');
      expect(response.body.post).toHaveProperty('upvotes');
      expect(response.body.post.upvotes).toBeGreaterThan(0);
    });

    it('should remove upvote when upvoting again', async () => {
      // Get current upvote count
      const currentResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentUpvotes = currentResponse.body.post.upvotes;

      // Upvote again (should remove the upvote)
      const response = await request(app)
        .post(`/posts/${testPostId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.post.upvotes).toBe(currentUpvotes - 1);
    });
  });

  describe('POST /posts/:id/downvote', () => {
    it('should downvote a post', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/downvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Downvote successful');
      expect(response.body.post).toHaveProperty('downvotes');
      expect(response.body.post.downvotes).toBeGreaterThan(0);
    });

    it('should remove downvote when downvoting again', async () => {
      // Get current downvote count
      const currentResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentDownvotes = currentResponse.body.post.downvotes;

      // Downvote again (should remove the downvote)
      const response = await request(app)
        .post(`/posts/${testPostId}/downvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.post.downvotes).toBe(currentDownvotes - 1);
    });
  });

  describe('POST /comments/:id/upvote', () => {
    it('should upvote a comment', async () => {
      const response = await request(app)
        .post(`/comments/${testCommentId}/upvote`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Comment upvote successful');
      expect(response.body.comment).toHaveProperty('upvotes');
      expect(response.body.comment.upvotes).toBeGreaterThan(0);
    });
  });

  describe('POST /comments/:id/downvote', () => {
    it('should downvote a comment', async () => {
      const response = await request(app)
        .post(`/comments/${testCommentId}/downvote`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Comment downvote successful');
      expect(response.body.comment).toHaveProperty('downvotes');
      expect(response.body.comment.downvotes).toBeGreaterThan(0);
    });
  });

  describe('POST /posts/:postId/accept-answer/:commentId', () => {
    it('should accept an answer', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/accept-answer/${testCommentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Answer accepted successfully');
    });

    it('should fail to accept answer if not post owner', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/accept-answer/${testCommentId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Only the post owner can accept answers');
    });
  });

  describe('PUT /posts/:id/status', () => {
    it('should update post status', async () => {
      const statusData = {
        status: 'closed'
      };

      const response = await request(app)
        .put(`/posts/${testPostId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post status updated successfully');
    });

    it('should fail to update status with invalid status', async () => {
      const statusData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .put(`/posts/${testPostId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid status');
    });

    it('should fail to update status if not post owner', async () => {
      const statusData = {
        status: 'closed'
      };

      const response = await request(app)
        .put(`/posts/${testPostId}/status`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(statusData)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Only the post owner can update status');
    });
  });

  describe('Database Triggers Test', () => {
    it('should automatically update answer count when comment is added', async () => {
      // Get initial answer count
      const initialResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialAnswerCount = initialResponse.body.post.answer_count;

      // Add another comment
      await request(app)
        .post(`/posts/${testPostId}/comment`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          content: 'Another test comment to verify trigger'
        });

      // Check if answer count was updated
      const finalResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalResponse.body.post.answer_count).toBe(initialAnswerCount + 1);
    });

    it('should automatically update vote counts when votes are added/removed', async () => {
      // Get initial vote counts
      const initialResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialUpvotes = initialResponse.body.post.upvotes;
      const initialDownvotes = initialResponse.body.post.downvotes;

      // Add an upvote
      await request(app)
        .post(`/posts/${testPostId}/upvote`)
        .set('Authorization', `Bearer ${authToken2}`);

      // Check if upvote count was updated
      const upvoteResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(upvoteResponse.body.post.upvotes).toBe(initialUpvotes + 1);

      // Add a downvote
      await request(app)
        .post(`/posts/${testPostId}/downvote`)
        .set('Authorization', `Bearer ${authToken2}`);

      // Check if downvote count was updated
      const downvoteResponse = await request(app)
        .get(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(downvoteResponse.body.post.downvotes).toBe(initialDownvotes + 1);
    });
  });
}); 