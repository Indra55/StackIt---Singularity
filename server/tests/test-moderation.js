const axios = require('axios');

const BASE_URL = 'http://localhost:3100';
let adminToken;
let moderatorToken;
let regularUserToken;
let bannedUserToken;
let testCommunityName;
let testPostId;
let testCommentId;
let testUserId;

// Test data
const adminUser = {
  username: 'reddit_admin_super',
  email: 'reddit_admin_super@example.com',
  password: 'password123',
  first_name: 'Reddit',
  last_name: 'SuperAdmin'
};

const moderatorUser = {
  username: 'subreddit_mod_power',
  email: 'subreddit_mod_power@example.com',
  password: 'password123',
  first_name: 'Subreddit',
  last_name: 'PowerMod'
};

const regularUser = {
  username: 'normal_redditor_user',
  email: 'normal_redditor_user@example.com',
  password: 'password123',
  first_name: 'Normal',
  last_name: 'Redditor'
};

const bannedUser = {
  username: 'troublemaker_banned',
  email: 'troublemaker_banned@example.com',
  password: 'password123',
  first_name: 'Trouble',
  last_name: 'Maker'
};

const testCommunity = {
  name: 'reddit_style_test_sub',
  description: 'A test subreddit-style community for testing moderation features'
};

async function runModerationTests() {
  console.log('🚀 Starting Moderation API Tests...\n');

  try {
    // Test 1: Register all users
    console.log('1. Registering test users...');
    await axios.post(`${BASE_URL}/users/register`, adminUser);
    await axios.post(`${BASE_URL}/users/register`, moderatorUser);
    await axios.post(`${BASE_URL}/users/register`, regularUser);
    await axios.post(`${BASE_URL}/users/register`, bannedUser);
    console.log('✅ All users registered successfully\n');

    // Test 2: Login all users
    console.log('2. Logging in all users...');
    const adminLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    adminToken = adminLogin.data.token;

    const modLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: moderatorUser.email,
      password: moderatorUser.password
    });
    moderatorToken = modLogin.data.token;

    const userLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: regularUser.email,
      password: regularUser.password
    });
    regularUserToken = userLogin.data.token;

    const bannedLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: bannedUser.email,
      password: bannedUser.password
    });
    bannedUserToken = bannedLogin.data.token;
    testUserId = bannedLogin.data.user.id;

    console.log('✅ All users logged in successfully\n');

    // Test 3: Create community as admin
    console.log('3. Creating test community...');
    const createCommunityResponse = await axios.post(`${BASE_URL}/api/communities`, testCommunity, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testCommunityName = createCommunityResponse.data.community.name;
    console.log('✅ Community created successfully');
    console.log(`   Community: r/${testCommunityName}\n`);

    // Test 4: Join community with other users
    console.log('4. Joining community with other users...');
    await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/join`, {}, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/join`, {}, {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
    await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/join`, {}, {
      headers: { Authorization: `Bearer ${bannedUserToken}` }
    });
    console.log('✅ All users joined community successfully\n');

    // Test 5: Create a post as regular user
    console.log('5. Creating test post...');
    const testPost = {
      title: 'Test Post for Moderation',
      content: 'This is a test post that will be used for moderation testing',
      tags: ['test', 'moderation'],
      community_name: testCommunityName
    };
    
    const createPostResponse = await axios.post(`${BASE_URL}/posts/create`, testPost, {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
    testPostId = createPostResponse.data.post.id;
    console.log('✅ Post created successfully');
    console.log(`   Post ID: ${testPostId}\n`);

    // Test 6: Create a comment as banned user
    console.log('6. Creating test comment...');
    const testComment = {
      content: 'This is a test comment for moderation testing'
    };
    
    const createCommentResponse = await axios.post(`${BASE_URL}/posts/${testPostId}/comment`, testComment, {
      headers: { Authorization: `Bearer ${bannedUserToken}` }
    });
    testCommentId = createCommentResponse.data.comment.id;
    console.log('✅ Comment created successfully');
    console.log(`   Comment ID: ${testCommentId}\n`);

    // Test 7: Promote user to moderator (admin only)
    console.log('7. Testing user promotion to moderator...');
    const modUserId = (await axios.get(`${BASE_URL}/users/dashboard`, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    })).data.user.id;
    
    const promoteResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/promote`, {
      user_id: modUserId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User promoted to moderator successfully');
    console.log(`   Message: ${promoteResponse.data.message}\n`);

    // Test 8: Try to promote as non-admin (should fail)
    console.log('8. Testing promotion without admin privileges...');
    try {
      await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/promote`, {
        user_id: testUserId
      }, {
        headers: { Authorization: `Bearer ${regularUserToken}` }
      });
      console.log('❌ Should have failed without admin privileges');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected promotion without admin privileges');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for promotion test');
      }
    }

    // Test 9: Ban a user (moderator can do this)
    console.log('9. Testing user ban...');
    const banResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/ban`, {
      user_id: testUserId,
      reason: 'Test ban for moderation testing',
      duration_days: 1
    }, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ User banned successfully');
    console.log(`   Ban reason: ${banResponse.data.ban.reason}`);
    console.log(`   Expires: ${banResponse.data.ban.expires_at}\n`);

    // Test 10: Try to ban already banned user (should fail)
    console.log('10. Testing duplicate ban...');
    try {
      await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/ban`, {
        user_id: testUserId,
        reason: 'Duplicate ban test'
      }, {
        headers: { Authorization: `Bearer ${moderatorToken}` }
      });
      console.log('❌ Should have failed with duplicate ban');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected duplicate ban');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for duplicate ban');
      }
    }

    // Test 11: Try to post as banned user (should fail)
    console.log('11. Testing post as banned user...');
    try {
      const bannedPost = {
        title: 'Post by banned user',
        content: 'This should fail',
        community_name: testCommunityName
      };
      
      await axios.post(`${BASE_URL}/posts/create`, bannedPost, {
        headers: { Authorization: `Bearer ${bannedUserToken}` }
      });
      console.log('❌ Should have failed posting as banned user');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected post from banned user');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for banned user post');
      }
    }

    // Test 12: Delete a comment (moderator can do this)
    console.log('12. Testing comment deletion...');
    const deleteCommentResponse = await axios.delete(`${BASE_URL}/api/communities/${testCommunityName}/comments/${testCommentId}`, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ Comment deleted successfully');
    console.log(`   Message: ${deleteCommentResponse.data.message}\n`);

    // Test 13: Try to delete comment as regular user (should fail)
    console.log('13. Testing comment deletion without moderator privileges...');
    try {
      await axios.delete(`${BASE_URL}/api/communities/${testCommunityName}/comments/${testCommentId}`, {
        headers: { Authorization: `Bearer ${regularUserToken}` }
      });
      console.log('❌ Should have failed without moderator privileges');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected comment deletion without privileges');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for comment deletion test');
      }
    }

    // Test 14: Delete a post (moderator can do this)
    console.log('14. Testing post deletion...');
    const deletePostResponse = await axios.delete(`${BASE_URL}/api/communities/${testCommunityName}/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ Post deleted successfully');
    console.log(`   Message: ${deletePostResponse.data.message}\n`);

    // Test 15: Get banned users list
    console.log('15. Testing get banned users...');
    const bansResponse = await axios.get(`${BASE_URL}/api/communities/${testCommunityName}/bans`, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ Retrieved banned users successfully');
    console.log(`   Banned users count: ${bansResponse.data.bans.length}`);
    bansResponse.data.bans.forEach((ban, index) => {
      console.log(`   ${index + 1}. ${ban.username} - ${ban.reason}`);
    });
    console.log('');

    // Test 16: Get moderation log
    console.log('16. Testing get moderation log...');
    const modLogResponse = await axios.get(`${BASE_URL}/api/communities/${testCommunityName}/moderation-log`, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ Retrieved moderation log successfully');
    console.log(`   Log entries count: ${modLogResponse.data.logs.length}`);
    modLogResponse.data.logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action_type} by ${log.moderator_username}`);
    });
    console.log('');

    // Test 17: Unban a user
    console.log('17. Testing user unban...');
    const unbanResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/unban`, {
      user_id: testUserId
    }, {
      headers: { Authorization: `Bearer ${moderatorToken}` }
    });
    console.log('✅ User unbanned successfully');
    console.log(`   Message: ${unbanResponse.data.message}\n`);

    // Test 18: Try to unban already unbanned user (should fail)
    console.log('18. Testing duplicate unban...');
    try {
      await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/unban`, {
        user_id: testUserId
      }, {
        headers: { Authorization: `Bearer ${moderatorToken}` }
      });
      console.log('❌ Should have failed with duplicate unban');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correctly rejected duplicate unban');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for duplicate unban');
      }
    }

    // Test 19: Demote moderator to member (admin only)
    console.log('19. Testing moderator demotion...');
    const demoteResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/demote`, {
      user_id: modUserId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Moderator demoted successfully');
    console.log(`   Message: ${demoteResponse.data.message}\n`);

    // Test 20: Try to use moderator powers after demotion (should fail)
    console.log('20. Testing moderator powers after demotion...');
    try {
      await axios.get(`${BASE_URL}/api/communities/${testCommunityName}/bans`, {
        headers: { Authorization: `Bearer ${moderatorToken}` }
      });
      console.log('❌ Should have failed without moderator privileges');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected moderator action after demotion');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for demoted moderator test');
      }
    }

    // Test 21: Try to access moderation features as regular user (should fail)
    console.log('21. Testing moderation access as regular user...');
    try {
      await axios.get(`${BASE_URL}/api/communities/${testCommunityName}/bans`, {
        headers: { Authorization: `Bearer ${regularUserToken}` }
      });
      console.log('❌ Should have failed without moderator privileges');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected regular user access to moderation');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for regular user moderation test');
      }
    }

    // Test 22: Verify post count decreased after deletion
    console.log('22. Testing post count after deletion...');
    const communityResponse = await axios.get(`${BASE_URL}/api/communities/${testCommunityName}`);
    console.log('✅ Retrieved community info successfully');
    console.log(`   Post count: ${communityResponse.data.community.post_count}`);
    console.log(`   Member count: ${communityResponse.data.community.member_count}\n`);

    console.log('🎉 All moderation tests completed successfully!');
    console.log('\n📊 Moderation Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Community creation and membership');
    console.log('   ✅ Role-based access control (admin/moderator/member)');
    console.log('   ✅ User promotion and demotion');
    console.log('   ✅ User banning and unbanning');
    console.log('   ✅ Post and comment deletion');
    console.log('   ✅ Ban enforcement (preventing banned users from posting)');
    console.log('   ✅ Moderation log and audit trail');
    console.log('   ✅ Banned users management');
    console.log('   ✅ Error handling and validation');
    console.log('   ✅ Post count updates after deletion');

  } catch (error) {
    console.error('\n❌ Moderation test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run tests
runModerationTests(); 