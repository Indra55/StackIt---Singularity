const axios = require('axios');

const BASE_URL = 'http://localhost:3100';
let authToken;
let testUserId;
let testCommunityName;
let testPostId;

// Test data
const testUser = {
  username: 'communitytestuser',
  email: 'communitytest@example.com',
  password: 'password123',
  first_name: 'Community',
  last_name: 'Test'
};

const testCommunity = {
  name: 'testcommunity',
  description: 'A test community for testing the API'
};

const testPost = {
  title: 'Test Post in Community',
  content: 'This is a test post content for testing community posting',
  tags: ['javascript', 'testing'],
  community_name: 'testcommunity'
};

async function runCommunityTests() {
  console.log('🚀 Starting Communities API Tests...\n');

  try {
    // Test 1: Register user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, testUser);
    testUserId = registerResponse.data.user.id;
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${testUserId}\n`);

    // Test 2: Login user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

    // Test 3: Get all communities (should be empty initially)
    console.log('3. Testing get all communities...');
    const communitiesResponse = await axios.get(`${BASE_URL}/api/communities`);
    console.log('✅ Retrieved all communities successfully');
    console.log(`   Communities count: ${communitiesResponse.data.communities.length}\n`);

    // Test 4: Create a community
    console.log('4. Testing community creation...');
    const createCommunityResponse = await axios.post(`${BASE_URL}/api/communities`, testCommunity, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testCommunityName = createCommunityResponse.data.community.name;
    console.log('✅ Community created successfully');
    console.log(`   Community name: r/${testCommunityName}`);
    console.log(`   Description: ${createCommunityResponse.data.community.description}`);
    console.log(`   Member count: ${createCommunityResponse.data.community.member_count}\n`);

    // Test 5: Get specific community
    console.log('5. Testing get specific community...');
    const getCommunityResponse = await axios.get(`${BASE_URL}/api/communities/${testCommunityName}`);
    console.log('✅ Retrieved specific community successfully');
    console.log(`   Community: r/${getCommunityResponse.data.community.name}`);
    console.log(`   Created by: ${getCommunityResponse.data.community.created_by_username}\n`);

    // Test 6: Try to create duplicate community (should fail)
    console.log('6. Testing duplicate community creation...');
    try {
      await axios.post(`${BASE_URL}/api/communities`, testCommunity, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with duplicate community name');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected duplicate community name');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for duplicate community');
      }
    }

    // Test 7: Create another user and try to join community
    console.log('7. Testing community joining...');
    const secondUser = {
      username: 'seconduser',
      email: 'seconduser@example.com',
      password: 'password123',
      first_name: 'Second',
      last_name: 'User'
    };
    
    // Register second user
    await axios.post(`${BASE_URL}/users/register`, secondUser);
    
    // Login second user
    const secondUserLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: secondUser.email,
      password: secondUser.password
    });
    const secondUserToken = secondUserLogin.data.token;
    
    // Join community
    const joinResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/join`, {}, {
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    console.log('✅ Second user joined community successfully');
    console.log(`   Message: ${joinResponse.data.message}\n`);

    // Test 8: Try to join again (should fail)
    console.log('8. Testing duplicate join...');
    try {
      await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/join`, {}, {
        headers: { Authorization: `Bearer ${secondUserToken}` }
      });
      console.log('❌ Should have failed with already member');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected duplicate join');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for duplicate join');
      }
    }

    // Test 9: Get user's subscribed communities
    console.log('9. Testing get user subscribed communities...');
    const subscribedResponse = await axios.get(`${BASE_URL}/api/communities/user/subscribed`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Retrieved user subscribed communities successfully');
    console.log(`   Subscribed communities: ${subscribedResponse.data.communities.length}`);
    subscribedResponse.data.communities.forEach((community, index) => {
      console.log(`   ${index + 1}. r/${community.name} (${community.role})`);
    });
    console.log('');

    // Test 10: Create a post in the community
    console.log('10. Testing post creation in community...');
    const createPostResponse = await axios.post(`${BASE_URL}/posts/create`, testPost, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    testPostId = createPostResponse.data.post.id;
    console.log('✅ Post created in community successfully');
    console.log(`   Post ID: ${testPostId}`);
    console.log(`   Community ID: ${createPostResponse.data.post.community_id}`);
    console.log(`   Tags: ${createPostResponse.data.post.tags?.join(', ')}\n`);

    // Test 11: Try to post in community without being a member (should fail)
    console.log('11. Testing post in community without membership...');
    const thirdUser = {
      username: 'thirduser',
      email: 'thirduser@example.com',
      password: 'password123',
      first_name: 'Third',
      last_name: 'User'
    };
    
    // Register and login third user
    await axios.post(`${BASE_URL}/users/register`, thirdUser);
    const thirdUserLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: thirdUser.email,
      password: thirdUser.password
    });
    const thirdUserToken = thirdUserLogin.data.token;
    
    // Try to post without joining
    try {
      await axios.post(`${BASE_URL}/posts/create`, testPost, {
        headers: { Authorization: `Bearer ${thirdUserToken}` }
      });
      console.log('❌ Should have failed without community membership');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Correctly rejected post without community membership');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for non-member post');
      }
    }

    // Test 12: Get posts from community
    console.log('12. Testing get community posts...');
    const communityPostsResponse = await axios.get(`${BASE_URL}/api/communities/${testCommunityName}/posts`);
    console.log('✅ Retrieved community posts successfully');
    console.log(`   Community: ${communityPostsResponse.data.community}`);
    console.log(`   Posts count: ${communityPostsResponse.data.posts.length}`);
    console.log(`   Page: ${communityPostsResponse.data.page}`);
    console.log(`   Limit: ${communityPostsResponse.data.limit}\n`);

    // Test 13: Create a post without community (should work)
    console.log('13. Testing post creation without community...');
    const noCommunityPost = {
      title: 'Post without community',
      content: 'This post is not associated with any community',
      tags: ['general']
    };
    
    const noCommunityResponse = await axios.post(`${BASE_URL}/posts/create`, noCommunityPost, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post created without community successfully');
    console.log(`   Post ID: ${noCommunityResponse.data.post.id}`);
    console.log(`   Community ID: ${noCommunityResponse.data.post.community_id || 'None'}\n`);

    // Test 14: Leave community
    console.log('14. Testing leave community...');
    const leaveResponse = await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/leave`, {}, {
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    console.log('✅ Second user left community successfully');
    console.log(`   Message: ${leaveResponse.data.message}\n`);

    // Test 15: Try to leave community as creator (should fail)
    console.log('15. Testing leave community as creator...');
    try {
      await axios.post(`${BASE_URL}/api/communities/${testCommunityName}/leave`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed leaving as creator');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected creator leaving community');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for creator leave');
      }
    }

    // Test 16: Test invalid community name
    console.log('16. Testing invalid community name...');
    const invalidCommunity = {
      name: 'invalid-community-name!',
      description: 'This should fail'
    };
    
    try {
      await axios.post(`${BASE_URL}/api/communities`, invalidCommunity, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with invalid community name');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected invalid community name');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for invalid community name');
      }
    }

    // Test 17: Test posting to non-existent community
    console.log('17. Testing post to non-existent community...');
    const nonExistentPost = {
      title: 'Post to non-existent community',
      content: 'This should fail',
      community_name: 'nonexistentcommunity'
    };
    
    try {
      await axios.post(`${BASE_URL}/posts/create`, nonExistentPost, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Should have failed with non-existent community');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected post to non-existent community');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Unexpected error for non-existent community');
      }
    }

    // Test 18: Get updated communities list
    console.log('18. Testing get updated communities list...');
    const updatedCommunitiesResponse = await axios.get(`${BASE_URL}/api/communities`);
    console.log('✅ Retrieved updated communities list successfully');
    console.log(`   Total communities: ${updatedCommunitiesResponse.data.communities.length}`);
    updatedCommunitiesResponse.data.communities.forEach((community, index) => {
      console.log(`   ${index + 1}. r/${community.name} - ${community.member_count} members`);
    });
    console.log('');

    console.log('🎉 All community tests completed successfully!');
    console.log('\n📊 Community Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Community creation and validation');
    console.log('   ✅ Community joining and leaving');
    console.log('   ✅ Community membership management');
    console.log('   ✅ Posting in communities');
    console.log('   ✅ Community post retrieval');
    console.log('   ✅ Optional community posting');
    console.log('   ✅ Community discovery');
    console.log('   ✅ User subscription tracking');
    console.log('   ✅ Error handling and validation');

  } catch (error) {
    console.error('\n❌ Community test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run tests
runCommunityTests(); 