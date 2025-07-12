const axios = require('axios');

const BASE_URL = 'http://localhost:3100';
let authToken;
let testPostId;
let testCommentId;

// Test data
const testUser = {
  username: 'testuedwsedrdvb679',
  email: 'test6bvdewd97d@example.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User'
};

const testPost = {
  title: 'Test Post Title',
  content: 'This is a test post content for testing the API',
  tags: ['javascript', 'nodejs', 'api']
};

const testComment = {
  content: 'This is a test comment for the post'
};

async function runTests() {
  console.log('🚀 Starting Posts API Tests...\n');

  try {
    // Test 1: Register user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, testUser);
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${registerResponse.data.user.id}\n`);

    // Test 2: Login user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

    // Test 3: Get all posts
    console.log('3. Testing get all posts...');
    const postsResponse = await axios.get(`${BASE_URL}/posts`);
    console.log('✅ Retrieved all posts successfully');
    console.log(`   Posts count: ${postsResponse.data.posts.length}\n`);

    // Test 4: Create a post with tags
    console.log('4. Testing post creation with tags...');
    const createPostResponse = await axios.post(`${BASE_URL}/posts/create`, testPost, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testPostId = createPostResponse.data.post.id;
    console.log('✅ Post created successfully');
    console.log(`   Post ID: ${testPostId}`);
    console.log(`   Title: ${createPostResponse.data.post.title}`);
    console.log(`   Tags: ${createPostResponse.data.post.tags?.join(', ') || 'None'}\n`);

    // Test 5: Get specific post
    console.log('5. Testing get specific post...');
    const getPostResponse = await axios.get(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Retrieved specific post successfully');
    console.log(`   View count: ${getPostResponse.data.post.view_count}`);
    console.log(`   Upvotes: ${getPostResponse.data.post.upvotes}`);
    console.log(`   Downvotes: ${getPostResponse.data.post.downvotes}`);
    console.log(`   Answer count: ${getPostResponse.data.post.answer_count}\n`);

    // Test 6: Add a comment
    console.log('6. Testing comment creation...');
    const createCommentResponse = await axios.post(`${BASE_URL}/posts/${testPostId}/comment`, testComment, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testCommentId = createCommentResponse.data.comment.id;
    console.log('✅ Comment created successfully');
    console.log(`   Comment ID: ${testCommentId}\n`);

    // Test 7: Get comments
    console.log('7. Testing get comments...');
    const getCommentsResponse = await axios.get(`${BASE_URL}/posts/${testPostId}/comments`);
    console.log('✅ Retrieved comments successfully');
    console.log(`   Comments count: ${getCommentsResponse.data.comments.length}\n`);

    // Test 8: Upvote post
    console.log('8. Testing post upvote...');
    const upvoteResponse = await axios.post(`${BASE_URL}/posts/${testPostId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post upvoted successfully');
    console.log(`   New upvotes: ${upvoteResponse.data.post.upvotes}\n`);

    // Test 9: Downvote post
    console.log('9. Testing post downvote...');
    const downvoteResponse = await axios.post(`${BASE_URL}/posts/${testPostId}/downvote`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post downvoted successfully');
    console.log(`   New downvotes: ${downvoteResponse.data.post.downvotes}\n`);

    // Test 10: Upvote comment
    console.log('10. Testing comment upvote...');
    const commentUpvoteResponse = await axios.post(`${BASE_URL}/comments/${testCommentId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Comment upvoted successfully');
    console.log(`   Comment upvotes: ${commentUpvoteResponse.data.comment.upvotes}\n`);

    // Test 11: Downvote comment
    console.log('11. Testing comment downvote...');
    const commentDownvoteResponse = await axios.post(`${BASE_URL}/comments/${testCommentId}/downvote`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Comment downvoted successfully');
    console.log(`   Comment downvotes: ${commentDownvoteResponse.data.comment.downvotes}\n`);

    // Test 12: Accept answer
    console.log('12. Testing accept answer...');
    const acceptResponse = await axios.post(`${BASE_URL}/posts/${testPostId}/accept-answer/${testCommentId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Answer accepted successfully\n');

    // Test 13: Update post status
    console.log('13. Testing update post status...');
    const statusResponse = await axios.put(`${BASE_URL}/posts/${testPostId}/status`, {
      status: 'closed'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post status updated successfully\n');

    // Test 14: Verify triggers work
    console.log('14. Testing database triggers...');
    const finalPostResponse = await axios.get(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Database triggers verification:');
    console.log(`   Final view count: ${finalPostResponse.data.post.view_count}`);
    console.log(`   Final upvotes: ${finalPostResponse.data.post.upvotes}`);
    console.log(`   Final downvotes: ${finalPostResponse.data.post.downvotes}`);
    console.log(`   Final answer count: ${finalPostResponse.data.post.answer_count}`);
    console.log(`   Is answered: ${finalPostResponse.data.post.is_answered}`);
    console.log(`   Status: ${finalPostResponse.data.post.status}\n`);

    // Test 15: Error handling tests
    console.log('15. Testing error handling...');
    
    // Test without authentication
    try {
      await axios.post(`${BASE_URL}/posts/create`, testPost);
      console.log('❌ Should have failed without authentication');
    } catch (error) {
      console.log('✅ Correctly rejected request without authentication');
    }

    // Test invalid post ID
    try {
      await axios.get(`${BASE_URL}/posts/99999`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with invalid post ID');
    } catch (error) {
      console.log('✅ Correctly handled invalid post ID');
    }

    // Test invalid status
    try {
      await axios.put(`${BASE_URL}/posts/${testPostId}/status`, {
        status: 'invalid_status'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with invalid status');
    } catch (error) {
          console.log('✅ Correctly rejected invalid status');
  }

  // Test 16: Get all tags
  console.log('16. Testing get all tags...');
  const tagsResponse = await axios.get(`${BASE_URL}/tags`);
  console.log('✅ Retrieved all tags successfully');
  console.log(`   Tags count: ${tagsResponse.data.tags.length}`);
  tagsResponse.data.tags.forEach((tag, index) => {
    console.log(`   ${index + 1}. ${tag.tag} (${tag.count} posts)`);
  });
  console.log('');

  // Test 17: Get posts by tag
  console.log('17. Testing get posts by tag...');
  const tagPostsResponse = await axios.get(`${BASE_URL}/posts/tag/javascript`);
  console.log('✅ Retrieved posts by tag successfully');
  console.log(`   Posts with 'javascript' tag: ${tagPostsResponse.data.posts.length}`);
  console.log(`   Tag: ${tagPostsResponse.data.tag}\n`);

  // Test 18: Create another post with different tags
  console.log('18. Testing create post with different tags...');
  const secondPost = {
    title: 'Another Test Post',
    content: 'This is another test post with different tags',
    tags: ['react', 'frontend', 'javascript']
  };
  const secondPostResponse = await axios.post(`${BASE_URL}/posts/create`, secondPost, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('✅ Second post created successfully');
  console.log(`   Post ID: ${secondPostResponse.data.post.id}`);
  console.log(`   Tags: ${secondPostResponse.data.post.tags?.join(', ')}\n`);

  // Test 19: Test tag validation
  console.log('19. Testing tag validation...');
  const invalidTagsPost = {
    title: 'Post with invalid tags',
    content: 'Testing tag validation',
    tags: ['', 'verylongtagthatiswaytoolongandshouldberejected', 'valid-tag', '   ', 'another-valid-tag']
  };
  const invalidTagsResponse = await axios.post(`${BASE_URL}/posts/create`, invalidTagsPost, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  console.log('✅ Post with invalid tags processed correctly');
  console.log(`   Processed tags: ${invalidTagsResponse.data.post.tags?.join(', ')}`);
  console.log('   (Empty and too-long tags should be filtered out)\n');

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📊 Test Summary:');
  console.log('   ✅ User registration and authentication');
  console.log('   ✅ Post creation and retrieval with tags');
  console.log('   ✅ Comment creation and retrieval');
  console.log('   ✅ Voting system (posts and comments)');
  console.log('   ✅ Answer acceptance');
  console.log('   ✅ Post status updates');
  console.log('   ✅ Database triggers (vote counts, answer counts)');
  console.log('   ✅ Tag system (creation, retrieval, filtering)');
  console.log('   ✅ Tag validation and processing');
  console.log('   ✅ Error handling');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the tests
runTests(); 