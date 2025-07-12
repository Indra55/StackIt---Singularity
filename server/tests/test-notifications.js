const axios = require('axios');
const BASE_URL = 'http://localhost:3100';

const userA = {
  username: 'notif_tester_a',
  email: 'notif_tester_a@example.com',
  password: 'password123',
  first_name: 'Notif',
  last_name: 'Alpha'
};
const userB = {
  username: 'notif_tester_b',
  email: 'notif_tester_b@example.com',
  password: 'password123',
  first_name: 'Notif',
  last_name: 'Beta'
};

let tokenA, tokenB, userAId, userBId, postId, commentId;

async function runNotificationTests() {
  console.log('🚀 Starting Notifications API Tests...\n');
  try {
    // Register users
    try { await axios.post(`${BASE_URL}/users/register`, userA); } catch {}
    try { await axios.post(`${BASE_URL}/users/register`, userB); } catch {}
    const loginA = await axios.post(`${BASE_URL}/users/login`, { email: userA.email, password: userA.password });
    const loginB = await axios.post(`${BASE_URL}/users/login`, { email: userB.email, password: userB.password });
    tokenA = loginA.data.token; userAId = loginA.data.user.id;
    tokenB = loginB.data.token; userBId = loginB.data.user.id;
    console.log('✅ Users registered and logged in');

    // User A creates a post mentioning user B (triggers mention notification)
    const postRes = await axios.post(`${BASE_URL}/posts/create`, {
      title: 'Hello @' + userB.username,
      content: 'This post mentions @' + userB.username,
      tags: ['notiftest']
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    postId = postRes.data.post.id;
    // Process mentions in post
    await axios.post(`${BASE_URL}/api/mentions/process`, {
      postId,
      content: 'This post mentions @' + userB.username
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Mention notification triggered');

    // User A comments on the post (triggers comment notification)
    const commentRes = await axios.post(`${BASE_URL}/posts/${postId}/comment`, {
      content: 'Comment by A'
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    commentId = commentRes.data.comment.id;
    console.log('✅ Comment created');

    // User B upvotes the post (triggers vote notification)
    await axios.post(`${BASE_URL}/posts/${postId}/upvote`, {}, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log('✅ Vote notification triggered');

    // User B answers the post (triggers answer notification)
    const answerRes = await axios.post(`${BASE_URL}/posts/${postId}/comment`, {
      content: 'Answer by B'
    }, { headers: { Authorization: `Bearer ${tokenB}` } });
    const answerId = answerRes.data.comment.id;
    // Accept answer (triggers answer notification)
    await axios.post(`${BASE_URL}/posts/${postId}/accept-answer/${answerId}`, {}, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Answer notification triggered');

    // Fetch notifications for user A
    const notifResA = await axios.get(`${BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Notifications for user A:', notifResA.data.notifications.length);

    // Fetch notifications for user B
    const notifResB = await axios.get(`${BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log('✅ Notifications for user B:', notifResB.data.notifications.length);

    // Get unread count for user B
    const unreadCount = await axios.get(`${BASE_URL}/api/notifications/count`, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log('✅ Unread notification count for user B:', unreadCount.data.count);

    // Mark one notification as read
    const notifId = notifResB.data.notifications[0]?.id;
    if (notifId) {
      await axios.put(`${BASE_URL}/api/notifications/${notifId}/read`, {}, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.log('✅ Marked one notification as read');
    }

    // Mark all as read
    await axios.put(`${BASE_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log('✅ Marked all notifications as read');

    // Delete a notification
    if (notifId) {
      await axios.delete(`${BASE_URL}/api/notifications/${notifId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.log('✅ Deleted a notification');
    }

    console.log('\n🎉 All notification API tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Notification API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

runNotificationTests(); 