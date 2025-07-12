const axios = require('axios');
const BASE_URL = 'http://localhost:3100';

const userA = {
  username: 'mention_tester_a',
  email: 'mention_tester_a@example.com',
  password: 'password123',
  first_name: 'Mention',
  last_name: 'Alpha'
};
const userB = {
  username: 'mention_tester_b',
  email: 'mention_tester_b@example.com',
  password: 'password123',
  first_name: 'Mention',
  last_name: 'Beta'
};

let tokenA, tokenB, userAId, userBId, postId, commentId;

async function runMentionTests() {
  console.log('🚀 Starting Mentions API Tests...\n');
  try {
    // Register users
    try { await axios.post(`${BASE_URL}/users/register`, userA); } catch {}
    try { await axios.post(`${BASE_URL}/users/register`, userB); } catch {}
    const loginA = await axios.post(`${BASE_URL}/users/login`, { email: userA.email, password: userA.password });
    const loginB = await axios.post(`${BASE_URL}/users/login`, { email: userB.email, password: userB.password });
    tokenA = loginA.data.token; userAId = loginA.data.user.id;
    tokenB = loginB.data.token; userBId = loginB.data.user.id;
    console.log('✅ Users registered and logged in');

    // User A creates a post mentioning user B
    const postRes = await axios.post(`${BASE_URL}/posts/create`, {
      title: 'Hello @' + userB.username,
      content: 'This post mentions @' + userB.username,
      tags: ['mentiontest']
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    postId = postRes.data.post.id;
    console.log('✅ Post created with mention');

    // Process mentions in post
    const mentionRes = await axios.post(`${BASE_URL}/api/mentions/process`, {
      postId,
      content: 'This post mentions @' + userB.username
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Mentions processed:', mentionRes.data.mentions.map(m => m.username));

    // User A comments mentioning user B
    const commentRes = await axios.post(`${BASE_URL}/posts/${postId}/comment`, {
      content: 'Comment mentioning @' + userB.username
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    commentId = commentRes.data.comment.id;
    console.log('✅ Comment created with mention');

    // Process mentions in comment
    const mentionCommentRes = await axios.post(`${BASE_URL}/api/mentions/process`, {
      commentId,
      content: 'Comment mentioning @' + userB.username
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Mentions in comment processed:', mentionCommentRes.data.mentions.map(m => m.username));

    // Test autocomplete
    const autoRes = await axios.get(`${BASE_URL}/api/mentions/users?query=${userB.username}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Autocomplete users:', autoRes.data.users.map(u => u.username));

    // Get mentions for post
    const postMentions = await axios.get(`${BASE_URL}/api/mentions/${postId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('✅ Mentions for post:', postMentions.data.mentions.map(m => m.mentioned_user.username));

    // Get mentions for user B
    const userMentions = await axios.get(`${BASE_URL}/api/mentions/user/${userBId}`, { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log('✅ Mentions for user:', userMentions.data.mentions.length);

    console.log('\n🎉 All mention API tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Mention API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

runMentionTests(); 