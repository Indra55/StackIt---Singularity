const axios = require('axios');

const BASE_URL = 'http://localhost:3100/api/admin';
const USER_URL = 'http://localhost:3100/users';

// Admin credentials (ensure this user exists and is admin)
const adminUser = {
  username: 'admin_test_user1',
  email: 'admin_test_user1@example.com',
  password: 'password123',
  first_name: 'Admin',
  last_name: 'Tester'
};

let adminToken;
let testUserId;
let testCommunityId;
let testPostId;
let testCommentId;

async function runAdminTests() {
  console.log('🚀 Starting Admin API Tests...\n');

  try {
    // 1. Register admin user (if not exists)
    try {
      await axios.post(`${USER_URL}/register`, adminUser);
      console.log('✅ Admin user registered');
    } catch (e) {
      console.log('ℹ️ Admin user may already exist:', e.response?.data?.message || e.message);
    }

    // 2. Login and promote to admin
    console.log('Attempting to login...');
    const loginRes = await axios.post(`${USER_URL}/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    adminToken = loginRes.data.token;
    const userId = loginRes.data.user.id;
    console.log('✅ Login successful, user ID:', userId);
    
    // Promote to admin using direct database update since we don't have admin yet
    const pool = require('../config/dbConfig');
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
    console.log('✅ Admin user promoted to admin');
    
    // Get fresh token with admin role
    const freshLoginRes = await axios.post(`${USER_URL}/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    adminToken = freshLoginRes.data.token;

    // 3. Create a test user
    const testUser = {
      username: 'admin_test_target',
      email: 'admin_test_target@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Target'
    };
    try {
      await axios.post(`${USER_URL}/register`, testUser);
    } catch (e) {}
    const testUserLogin = await axios.post(`${USER_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    testUserId = testUserLogin.data.user.id;
    console.log('✅ Test user created');

    // 4. List all users
    const usersRes = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Users listed: ${usersRes.data.users.length}`);

    // 5. Ban and unban test user
    await axios.post(`${BASE_URL}/users/${testUserId}/ban`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test user banned');
    await axios.post(`${BASE_URL}/users/${testUserId}/unban`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test user unbanned');

    // 6. Demote and promote test user
    await axios.post(`${BASE_URL}/users/${testUserId}/demote`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test user demoted');
    await axios.post(`${BASE_URL}/users/${testUserId}/promote`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test user promoted');

    // 7. Create a test community
    const communityRes = await axios.post('http://localhost:3100/api/communities', {
      name: 'admin_test_community',
      description: 'Admin test community'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testCommunityId = communityRes.data.community.id;
    console.log('✅ Test community created');

    // 8. List all communities
    const commsRes = await axios.get(`${BASE_URL}/communities`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Communities listed: ${commsRes.data.communities.length}`);

    // 9. Get community details
    const commDetail = await axios.get(`${BASE_URL}/communities/${testCommunityId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Community details fetched: ${commDetail.data.community.name}`);

    // 10. Create a test post
    const postRes = await axios.post('http://localhost:3100/posts/create', {
      title: 'Admin Test Post',
      content: 'This is a post for admin API testing',
      community_name: 'admin_test_community'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testPostId = postRes.data.post.id;
    console.log('✅ Test post created');

    // 11. List all posts
    const postsRes = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Posts listed: ${postsRes.data.posts.length}`);

    // 12. Create a test comment
    const commentRes = await axios.post(`http://localhost:3100/posts/${testPostId}/comment`, {
      content: 'Admin test comment'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testCommentId = commentRes.data.comment.id;
    console.log('✅ Test comment created');

    // 13. List all comments
    const commentsRes = await axios.get(`${BASE_URL}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Comments listed: ${commentsRes.data.comments.length}`);

    // 14. Delete test comment
    await axios.delete(`${BASE_URL}/comments/${testCommentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test comment deleted');

    // 15. Delete test post
    await axios.delete(`${BASE_URL}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test post deleted');

    // 16. Delete test community
    await axios.delete(`${BASE_URL}/communities/${testCommunityId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Test community deleted');

    // 17. Get site metrics
    const metricsRes = await axios.get(`${BASE_URL}/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Site metrics:', metricsRes.data.metrics);

    console.log('\n🎉 All admin API tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Admin API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error details:', error);
    }
  }
}

runAdminTests(); 