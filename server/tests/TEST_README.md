# Posts API Testing Guide

This guide explains how to test the Posts API endpoints and verify that everything is working correctly, including the database triggers.

## Prerequisites

1. Make sure your server is running on `http://localhost:3100`
2. Ensure your database is connected and the triggers are properly set up
3. Install the test dependencies

## Installation

```bash
# Install test dependencies
npm install

# Or install specific dependencies
npm install axios jest supertest
```

## Running Tests

### 1. Simple Test Script (Recommended)

This is a comprehensive test that checks all endpoints and verifies database triggers:

```bash
npm test
```

Or run directly:

```bash
node test-posts.js
```

### 2. Jest Tests

For more detailed unit tests:

```bash
npm run test:jest
```

Or run directly:

```bash
npx jest posts.test.js
```

## What the Tests Verify

### ✅ Authentication & Authorization
- User registration and login
- JWT token validation
- Protected route access
- Unauthorized request handling

### ✅ Post Management
- Creating posts with title and content
- Retrieving all posts
- Getting specific posts with comments
- View count tracking
- Post status updates

### ✅ Comment System
- Adding comments to posts
- Retrieving comments for posts
- Comment ordering (accepted first, then by votes)

### ✅ Voting System
- Upvoting and downvoting posts
- Upvoting and downvoting comments
- Vote toggle functionality (upvote again removes vote)
- Vote count updates via database triggers

### ✅ Answer Acceptance
- Marking comments as accepted answers
- Post owner permission validation
- Updating post `is_answered` and `accepted_answer_id`

### ✅ Database Triggers
- **Vote Count Triggers**: Automatically update `upvotes` and `downvotes` counts
- **Answer Count Triggers**: Automatically update `answer_count` when comments are added/removed
- **View Count**: Manually incremented when posts are viewed

### ✅ Error Handling
- Missing authentication
- Invalid data validation
- Permission checks
- Invalid IDs and statuses

## Test Output Example

```
🚀 Starting Posts API Tests...

1. Testing user registration...
✅ User registered successfully
   User ID: 123

2. Testing user login...
✅ User logged in successfully
   Token: eyJhbGciOiJIUzI1NiIs...

3. Testing get all posts...
✅ Retrieved all posts successfully
   Posts count: 5

4. Testing post creation...
✅ Post created successfully
   Post ID: 456
   Title: Test Post Title

5. Testing get specific post...
✅ Retrieved specific post successfully
   View count: 1
   Upvotes: 0
   Downvotes: 0
   Answer count: 0

6. Testing comment creation...
✅ Comment created successfully
   Comment ID: 789

7. Testing get comments...
✅ Retrieved comments successfully
   Comments count: 1

8. Testing post upvote...
✅ Post upvoted successfully
   New upvotes: 1

9. Testing post downvote...
✅ Post downvoted successfully
   New downvotes: 1

10. Testing comment upvote...
✅ Comment upvoted successfully
   Comment upvotes: 1

11. Testing comment downvote...
✅ Comment downvoted successfully
   Comment downvotes: 1

12. Testing accept answer...
✅ Answer accepted successfully

13. Testing update post status...
✅ Post status updated successfully

14. Testing database triggers...
✅ Database triggers verification:
   Final view count: 2
   Final upvotes: 1
   Final downvotes: 1
   Final answer count: 1
   Is answered: true
   Status: closed

15. Testing error handling...
✅ Correctly rejected request without authentication
✅ Correctly handled invalid post ID
✅ Correctly rejected invalid status

🎉 All tests completed successfully!

📊 Test Summary:
   ✅ User registration and authentication
   ✅ Post creation and retrieval
   ✅ Comment creation and retrieval
   ✅ Voting system (posts and comments)
   ✅ Answer acceptance
   ✅ Post status updates
   ✅ Database triggers (vote counts, answer counts)
   ✅ Error handling
```

## Manual Testing with curl

You can also test individual endpoints manually:

```bash
# Set your token
export TOKEN="your_jwt_token_here"

# Test endpoints
curl -X GET http://localhost:3100/posts
curl -X POST http://localhost:3100/posts/create -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title":"Test","content":"Test content"}'
curl -X GET http://localhost:3100/posts/1 -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:3100/posts/1/upvote -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Common Issues

1. **Server not running**: Make sure your server is running on port 3100
2. **Database connection**: Verify your database is connected and triggers are set up
3. **Authentication errors**: Check if JWT tokens are being generated correctly
4. **Trigger not working**: Verify the database triggers are properly installed

### Debug Mode

To see more detailed output, you can modify the test files to include more logging:

```javascript
// Add this to see detailed responses
console.log('Response:', JSON.stringify(response.data, null, 2));
```

### Database Verification

You can also verify the triggers are working by checking the database directly:

```sql
-- Check vote counts
SELECT id, title, upvotes, downvotes, answer_count, is_answered 
FROM posts 
WHERE id = [your_post_id];

-- Check post_votes table
SELECT * FROM post_votes WHERE post_id = [your_post_id];

-- Check comments
SELECT id, content, upvotes, downvotes, is_accepted 
FROM comments 
WHERE post_id = [your_post_id];
```

## Expected Behavior

- **Vote counts should update automatically** when votes are added/removed
- **Answer count should increment** when comments are added
- **View count should increment** each time a post is viewed
- **Accepted answers should appear first** in comment lists
- **All operations should be atomic** and consistent

If any of these behaviors are not working, check your database triggers and ensure they're properly installed and functioning. 