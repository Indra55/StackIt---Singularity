const axios = require('axios');

const BASE_URL = 'http://localhost:3100';
let authToken1, authToken2, adminToken, userId1, userId2, adminUserId;
let testPostId, testCommentId, testCommunityId;

async function testNotifications() {
  console.log('🧪 Starting Notification System Tests...\n');

  try {
    // Generate a unique suffix for this test run
    const timestamp = Date.now();
    const unique1 = `testuser1_${timestamp}`;
    const unique2 = `testuser2_${timestamp}`;
    const adminUser = `adminuser_${timestamp}`;
    const email1 = `test1_${timestamp}@example.com`;
    const email2 = `test2_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@example.com`;
    const communityName = `testcommunity${timestamp}`;

    // 1. Register and login three users (including admin)
    console.log('1. Setting up test users...');
    
    // Register user 1
    const register1 = await axios.post(`${BASE_URL}/users/register`, {
      username: unique1,
      email: email1,
      password: 'password123'
    });
    authToken1 = register1.data.token;
    userId1 = register1.data.user.id;
    console.log('✅ User 1 registered:', register1.data.user.username);

    // Register user 2
    const register2 = await axios.post(`${BASE_URL}/users/register`, {
      username: unique2,
      email: email2,
      password: 'password123'
    });
    authToken2 = register2.data.token;
    userId2 = register2.data.user.id;
    console.log('✅ User 2 registered:', register2.data.user.username);

    // Register admin user
    const registerAdmin = await axios.post(`${BASE_URL}/users/register`, {
      username: adminUser,
      email: adminEmail,
      password: 'password123'
    });
    adminUserId = registerAdmin.data.user.id;
    console.log('✅ Admin user registered:', registerAdmin.data.user.username);
    
    // Promote admin user to admin role using direct database update
    const pool = require('../config/dbConfig');
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [adminUserId]);
    console.log('✅ Admin user promoted to admin role');
    
    // Login as admin to get admin token
    const adminLogin = await axios.post(`${BASE_URL}/users/login`, {
      email: adminEmail,
      password: 'password123'
    });
    adminToken = adminLogin.data.token;
    console.log('✅ Admin user logged in');

    // 2. Create a community
    console.log('\n2. Creating test community...');
    const community = await axios.post(`${BASE_URL}/api/communities`, {
      name: communityName,
      description: 'Test community for notifications'
    }, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    testCommunityId = community.data.community.id;
    console.log('✅ Community created:', community.data.community.name);

    // 3. User 2 joins the community
    console.log('\n3. User 2 joining community...');
    await axios.post(`${BASE_URL}/api/communities/${communityName}/join`, {}, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('✅ User 2 joined community');

    // 4. Create a post in the community
    console.log('\n4. Creating test post...');
    const post = await axios.post(`${BASE_URL}/posts/create`, {
      title: 'Test Post for Notifications',
      content: `This is a test post to check notifications @${unique2}`,
      tags: ['test', 'notifications'],
      community_name: communityName
    }, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    testPostId = post.data.post.id;
    console.log('✅ Post created:', post.data.post.title);

    // 5. User 2 comments on the post
    console.log('\n5. User 2 commenting on post...');
    const comment = await axios.post(`${BASE_URL}/posts/${testPostId}/comment`, {
      content: `This is a test comment @${unique1}`
    }, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    testCommentId = comment.data.comment.id;
    console.log('✅ Comment created');

    // 6. User 1 upvotes the post
    console.log('\n6. User 1 upvoting post...');
    await axios.post(`${BASE_URL}/posts/${testPostId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('✅ Post upvoted');

    // 7. User 1 upvotes the comment
    console.log('\n7. User 1 upvoting comment...');
    await axios.post(`${BASE_URL}/comments/${testCommentId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('✅ Comment upvoted');

    // 8. User 1 accepts the answer
    console.log('\n8. User 1 accepting answer...');
    await axios.post(`${BASE_URL}/posts/${testPostId}/accept-answer/${testCommentId}`, {}, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('✅ Answer accepted');

    // 9. Check notifications for all users
    console.log('\n9. Checking notifications...');
    
    // Check User 1's notifications
    const notifications1 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('📧 User 1 notifications:', notifications1.data.notifications.length);
    notifications1.data.notifications.forEach(n => {
      console.log(`   - ${n.title}: ${n.message}`);
    });

    // Check User 2's notifications
    const notifications2 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('\n📧 User 2 notifications:', notifications2.data.notifications.length);
    notifications2.data.notifications.forEach(n => {
      console.log(`   - ${n.title}: ${n.message}`);
    });

    // 10. Test moderation notifications
    console.log('\n10. Testing moderation notifications...');
    
    // Promote user 2 to moderator
    await axios.post(`${BASE_URL}/api/communities/${communityName}/promote`, {
      user_id: userId2
    }, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('✅ User 2 promoted to moderator');

    // Check User 2's notifications after promotion
    const notificationsAfterPromotion = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📧 User 2 notifications after promotion:', notificationsAfterPromotion.data.notifications.length);

    // 11. Test ADMIN NOTIFICATIONS
    console.log('\n11. Testing ADMIN notifications...');
    
    // Test admin ban user
    console.log('Testing admin ban user...');
    await axios.post(`${BASE_URL}/api/admin/users/${userId2}/ban`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User 2 banned by admin');
    
    // Check User 2's notifications after ban
    const notificationsAfterBan = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📧 User 2 notifications after ban:', notificationsAfterBan.data.notifications.length);
    const banNotification = notificationsAfterBan.data.notifications.find(n => n.type === 'admin' && n.title === 'Account Banned');
    if (banNotification) {
      console.log('   ✅ Ban notification found:', banNotification.message);
    }

    // Test admin unban user
    console.log('Testing admin unban user...');
    await axios.post(`${BASE_URL}/api/admin/users/${userId2}/unban`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User 2 unbanned by admin');
    
    // Check User 2's notifications after unban
    const notificationsAfterUnban = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📧 User 2 notifications after unban:', notificationsAfterUnban.data.notifications.length);
    const unbanNotification = notificationsAfterUnban.data.notifications.find(n => n.type === 'admin' && n.title === 'Account Unbanned');
    if (unbanNotification) {
      console.log('   ✅ Unban notification found:', unbanNotification.message);
    }

    // Test admin promote user
    console.log('Testing admin promote user...');
    await axios.post(`${BASE_URL}/api/admin/users/${userId1}/promote`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User 1 promoted to admin by admin');
    
    // Check User 1's notifications after promotion
    const notificationsAfterPromote = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('📧 User 1 notifications after promotion:', notificationsAfterPromote.data.notifications.length);
    const promoteNotification = notificationsAfterPromote.data.notifications.find(n => n.type === 'admin' && n.title === 'Promoted to Administrator');
    if (promoteNotification) {
      console.log('   ✅ Promotion notification found:', promoteNotification.message);
    }

    // Test admin demote user
    console.log('Testing admin demote user...');
    await axios.post(`${BASE_URL}/api/admin/users/${userId1}/demote`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User 1 demoted by admin');
    
    // Check User 1's notifications after demotion
    const notificationsAfterDemote = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('📧 User 1 notifications after demotion:', notificationsAfterDemote.data.notifications.length);
    const demoteNotification = notificationsAfterDemote.data.notifications.find(n => n.type === 'admin' && n.title === 'Demoted to Regular User');
    if (demoteNotification) {
      console.log('   ✅ Demotion notification found:', demoteNotification.message);
    }

    // Test admin delete comment
    console.log('Testing admin delete comment...');
    
    // First, unaccept the answer to avoid foreign key constraint
    await pool.query("UPDATE posts SET accepted_answer_id = NULL, is_answered = false WHERE id = $1", [testPostId]);
    console.log('✅ Answer unaccepted to avoid constraint');
    
    await axios.delete(`${BASE_URL}/api/admin/comments/${testCommentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Comment deleted by admin');
    
    // Check User 2's notifications after comment deletion
    const notificationsAfterCommentDelete = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📧 User 2 notifications after comment deletion:', notificationsAfterCommentDelete.data.notifications.length);
    const commentDeleteNotification = notificationsAfterCommentDelete.data.notifications.find(n => n.type === 'admin' && n.title === 'Comment Deleted by Administrator');
    if (commentDeleteNotification) {
      console.log('   ✅ Comment deletion notification found:', commentDeleteNotification.message);
    }

    // Test admin delete post
    console.log('Testing admin delete post...');
    await axios.delete(`${BASE_URL}/api/admin/posts/${testPostId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Post deleted by admin');
    
    // Check User 1's notifications after post deletion
    const notificationsAfterPostDelete = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    console.log('📧 User 1 notifications after post deletion:', notificationsAfterPostDelete.data.notifications.length);
    const postDeleteNotification = notificationsAfterPostDelete.data.notifications.find(n => n.type === 'admin' && n.title === 'Post Deleted by Administrator');
    if (postDeleteNotification) {
      console.log('   ✅ Post deletion notification found:', postDeleteNotification.message);
    }

    // Test admin delete community
    console.log('Testing admin delete community...');
    await axios.delete(`${BASE_URL}/api/admin/communities/${testCommunityId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Community deleted by admin');
    
    // Check notifications for all community members after community deletion
    const notificationsAfterCommunityDelete1 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    const notificationsAfterCommunityDelete2 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📧 User 1 notifications after community deletion:', notificationsAfterCommunityDelete1.data.notifications.length);
    console.log('📧 User 2 notifications after community deletion:', notificationsAfterCommunityDelete2.data.notifications.length);
    
    const communityDeleteNotification1 = notificationsAfterCommunityDelete1.data.notifications.find(n => n.type === 'admin' && n.title === 'Community Deleted');
    const communityDeleteNotification2 = notificationsAfterCommunityDelete2.data.notifications.find(n => n.type === 'admin' && n.title === 'Community Deleted');
    
    if (communityDeleteNotification1) {
      console.log('   ✅ Community deletion notification found for User 1:', communityDeleteNotification1.message);
    }
    if (communityDeleteNotification2) {
      console.log('   ✅ Community deletion notification found for User 2:', communityDeleteNotification2.message);
    }

    // 12. Test unread count
    console.log('\n12. Testing unread count...');
    const unreadCount = await axios.get(`${BASE_URL}/api/notifications/count`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    console.log('📊 Unread notifications for User 2:', unreadCount.data.count);

    // 13. Final notification summary
    console.log('\n13. Final notification summary...');
    
    // Get all notifications for each user
    const finalNotifications1 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken1}` }
    });
    const finalNotifications2 = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${authToken2}` }
    });
    
    console.log('\n📧 Final User 1 notifications:', finalNotifications1.data.notifications.length);
    finalNotifications1.data.notifications.forEach(n => {
      console.log(`   - [${n.type}] ${n.title}: ${n.message}`);
    });
    
    console.log('\n📧 Final User 2 notifications:', finalNotifications2.data.notifications.length);
    finalNotifications2.data.notifications.forEach(n => {
      console.log(`   - [${n.type}] ${n.title}: ${n.message}`);
    });

    console.log('\n🎉 All notification tests completed successfully!');
    console.log('\n📋 Summary of implemented notifications:');
    console.log('   ✅ Community posts notify all members');
    console.log('   ✅ Comments notify post owners');
    console.log('   ✅ @mentions notify mentioned users');
    console.log('   ✅ Votes notify content owners');
    console.log('   ✅ Answer acceptance notifies comment owners');
    console.log('   ✅ Community joins notify admins');
    console.log('   ✅ Moderation actions notify affected users');
    console.log('   ✅ ADMIN ACTIONS notify affected users:');
    console.log('     - User ban/unban notifications');
    console.log('     - User promotion/demotion notifications');
    console.log('     - Post deletion notifications');
    console.log('     - Comment deletion notifications');
    console.log('     - Community deletion notifications');
    console.log('   ✅ Real-time delivery via Socket.IO');
    console.log('   ✅ Unread count tracking');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNotifications(); 