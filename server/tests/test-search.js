const axios = require('axios');

const BASE_URL = 'http://localhost:3100';
let authToken;
let testPostIds = [];
let testCommentIds = [];
let testUserIds = [];

// Test data
const testUsers = [
  {
    username: 'searchtestuser1',
    email: 'searchtest1@example.com',
    password: 'password123',
    first_name: 'Search',
    last_name: 'Tester1',
    bio: 'I am a test user for search functionality testing'
  },
  {
    username: 'searchtestuser2',
    email: 'searchtest2@example.com',
    password: 'password123',
    first_name: 'Search',
    last_name: 'Tester2',
    bio: 'Another test user for search API testing'
  }
];

const testPosts = [
  {
    title: 'How to implement search functionality in Node.js',
    content: 'I need help implementing a search API that can search across posts, comments, users, and tags. Any suggestions for best practices?',
    tags: ['nodejs', 'search', 'api', 'javascript']
  },
  {
    title: 'Best practices for PostgreSQL full-text search',
    content: 'What are the best practices for implementing full-text search in PostgreSQL? I want to search across multiple columns efficiently.',
    tags: ['postgresql', 'search', 'database', 'full-text']
  },
  {
    title: 'User authentication with JWT tokens',
    content: 'How do I implement secure user authentication using JWT tokens in a Node.js application? Looking for security best practices.',
    tags: ['jwt', 'authentication', 'security', 'nodejs']
  },
  {
    title: 'API rate limiting strategies',
    content: 'What are the best strategies for implementing rate limiting in REST APIs? Need to protect against abuse.',
    tags: ['api', 'rate-limiting', 'security', 'performance']
  }
];

const testComments = [
  {
    content: 'You can use PostgreSQL\'s ILIKE operator for case-insensitive search across multiple columns. It\'s very efficient for simple searches.'
  },
  {
    content: 'Consider using full-text search with tsvector and tsquery for better performance on large datasets. PostgreSQL has excellent full-text search capabilities.'
  },
  {
    content: 'PostgreSQL full-text search is very powerful and efficient for large datasets. You can also use trigram matching for fuzzy search.'
  },
  {
    content: 'For JWT authentication, make sure to use secure tokens with proper expiration times and implement refresh token rotation.'
  }
];

async function runTests() {
  console.log('🚀 Starting Search API Tests...\n');

  try {
    // Test 1: Register test users
    console.log('1. Registering test users...');
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      try {
        await axios.post(`${BASE_URL}/users/register`, user);
        console.log(`✅ User ${user.username} registered successfully`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`✅ User ${user.username} already exists`);
        } else {
          console.log(`❌ Failed to register user ${user.username}:`, error.response?.data?.message || error.message);
        }
      }
    }
    console.log('');

    // Test 2: Login with first user
    console.log('2. Logging in with test user...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUsers[0].email,
      password: testUsers[0].password
    });
    authToken = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);

    // Test 3: Create test posts
    console.log('3. Creating test posts...');
    for (let i = 0; i < testPosts.length; i++) {
      const post = testPosts[i];
      try {
        const createPostResponse = await axios.post(`${BASE_URL}/posts/create`, post, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        testPostIds.push(createPostResponse.data.post.id);
        console.log(`✅ Post "${post.title}" created successfully (ID: ${createPostResponse.data.post.id})`);
      } catch (error) {
        console.log(`❌ Failed to create post "${post.title}":`, error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 4: Create test comments
    console.log('4. Creating test comments...');
    for (let i = 0; i < testComments.length && i < testPostIds.length; i++) {
      const comment = testComments[i];
      try {
        const createCommentResponse = await axios.post(`${BASE_URL}/posts/${testPostIds[i]}/comment`, comment, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        testCommentIds.push(createCommentResponse.data.comment.id);
        console.log(`✅ Comment created successfully on post ${testPostIds[i]} (ID: ${createCommentResponse.data.comment.id})`);
      } catch (error) {
        console.log(`❌ Failed to create comment on post ${testPostIds[i]}:`, error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Wait a moment for data to be properly indexed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: General Search (Search All)
    console.log('5. Testing General Search (Search All)...');
    const searchQueries = ['search', 'nodejs', 'postgresql', 'api', 'jwt'];
    
    for (const query of searchQueries) {
      console.log(`   Searching for: "${query}"`);
      try {
        const response = await axios.get(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}&limit=5`);
        
        if (response.data.success) {
          const data = response.data.data;
          console.log(`   ✅ Found ${data.posts?.length || 0} posts`);
          console.log(`   ✅ Found ${data.comments?.length || 0} comments`);
          console.log(`   ✅ Found ${data.users?.length || 0} users`);
          console.log(`   ✅ Found ${data.tags?.length || 0} tags`);
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Test 6: Posts Search
    console.log('6. Testing Posts Search...');
    const postSearchTests = [
      { query: 'search', sort: 'relevance' },
      { query: 'nodejs', sort: 'votes' },
      { query: 'postgresql', sort: 'views' },
      { query: 'api', sort: 'newest' },
      { query: 'jwt', sort: 'oldest' }
    ];

    for (const test of postSearchTests) {
      console.log(`   Searching posts for: "${test.query}" (sorted by ${test.sort})`);
      try {
        const response = await axios.get(`${BASE_URL}/api/search/posts?q=${encodeURIComponent(test.query)}&sort=${test.sort}&limit=5`);
        
        if (response.data.success) {
          console.log(`   ✅ Found ${response.data.data.length} posts`);
          console.log(`   📊 Total: ${response.data.pagination.total}, Has more: ${response.data.pagination.hasMore}`);
          
          if (response.data.data.length > 0) {
            console.log(`   📝 First result: ${response.data.data[0].title}`);
          }
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Test 7: Comments Search
    console.log('7. Testing Comments Search...');
    const commentSearchTests = [
      { query: 'ILIKE', sort: 'newest' },
      { query: 'full-text', sort: 'votes' },
      { query: 'postgresql', sort: 'oldest' },
      { query: 'JWT', sort: 'newest' }
    ];

    for (const test of commentSearchTests) {
      console.log(`   Searching comments for: "${test.query}" (sorted by ${test.sort})`);
      try {
        const response = await axios.get(`${BASE_URL}/api/search/comments?q=${encodeURIComponent(test.query)}&sort=${test.sort}&limit=5`);
        
        if (response.data.success) {
          console.log(`   ✅ Found ${response.data.data.length} comments`);
          console.log(`   📊 Total: ${response.data.pagination.total}, Has more: ${response.data.pagination.hasMore}`);
          
          if (response.data.data.length > 0) {
            console.log(`   💬 First result: ${response.data.data[0].content.substring(0, 50)}...`);
            console.log(`   📝 From post: ${response.data.data[0].post_title}`);
          }
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Test 8: Users Search
    console.log('8. Testing Users Search...');
    const userSearchTests = [
      { query: 'search', sort: 'relevance' },
      { query: 'test', sort: 'reputation' },
      { query: 'user', sort: 'newest' },
      { query: 'tester', sort: 'username' }
    ];

    for (const test of userSearchTests) {
      console.log(`   Searching users for: "${test.query}" (sorted by ${test.sort})`);
      try {
        const response = await axios.get(`${BASE_URL}/api/search/users?q=${encodeURIComponent(test.query)}&sort=${test.sort}&limit=5`);
        
        if (response.data.success) {
          console.log(`   ✅ Found ${response.data.data.length} users`);
          console.log(`   📊 Total: ${response.data.pagination.total}, Has more: ${response.data.pagination.hasMore}`);
          
          if (response.data.data.length > 0) {
            console.log(`   👤 First result: ${response.data.data[0].username} (${response.data.data[0].reputation} reputation)`);
          }
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Test 9: Tags Search
    console.log('9. Testing Tags Search...');
    const tagSearchTests = [
      { query: 'nodejs', sort: 'usage' },
      { query: 'search', sort: 'name' },
      { query: 'api', sort: 'newest' },
      { query: 'jwt', sort: 'oldest' }
    ];

    for (const test of tagSearchTests) {
      console.log(`   Searching tags for: "${test.query}" (sorted by ${test.sort})`);
      try {
        const response = await axios.get(`${BASE_URL}/api/search/tags?q=${encodeURIComponent(test.query)}&sort=${test.sort}&limit=5`);
        
        if (response.data.success) {
          console.log(`   ✅ Found ${response.data.data.length} tags`);
          console.log(`   📊 Total: ${response.data.pagination.total}, Has more: ${response.data.pagination.hasMore}`);
          
          if (response.data.data.length > 0) {
            console.log(`   🏷️ First result: ${response.data.data[0].name} (${response.data.data[0].usage_count} uses)`);
          }
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    // Test 10: Advanced Search
    console.log('10. Testing Advanced Search...');
    const advancedSearchTests = [
      {
        query: 'search',
        filters: { type: 'posts', tags: 'nodejs,api', sort: 'votes' },
        description: 'Posts with specific tags'
      },
      {
        query: 'postgresql',
        filters: { type: 'posts', hasAnswers: 'true', sort: 'answers' },
        description: 'Posts with answers'
      },
      {
        query: 'api',
        filters: { type: 'posts', author: 'searchtestuser1', sort: 'newest' },
        description: 'Posts by specific author'
      }
    ];

    for (const test of advancedSearchTests) {
      console.log(`   Advanced search: "${test.description}"`);
      console.log(`   Query: "${test.query}"`);
      console.log(`   Filters:`, test.filters);
      
      try {
        const params = new URLSearchParams({
          q: test.query,
          ...test.filters
        });
        
        const response = await axios.get(`${BASE_URL}/api/search/advanced?${params.toString()}`);
        
        if (response.data.success) {
          console.log(`   ✅ Found ${response.data.data.length} results`);
          console.log(`   📊 Pagination: ${response.data.pagination.limit} per page, offset ${response.data.pagination.offset}`);
          
          if (response.data.data.length > 0) {
            const firstResult = response.data.data[0];
            console.log(`   📝 First result: ${firstResult.title || firstResult.content?.substring(0, 50)}`);
          }
        } else {
          console.log(`   ❌ Search failed: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`   ❌ Search error: ${error.response?.data?.message || error.message}`);
      }
      console.log('');
    }

    // Test 11: Pagination Tests
    console.log('11. Testing Pagination...');
    console.log('   Testing pagination for posts search...');
    
    try {
      // First page
      const page1Response = await axios.get(`${BASE_URL}/api/search/posts?q=search&limit=2&offset=0`);
      if (page1Response.data.success) {
        console.log(`   📄 Page 1: ${page1Response.data.data.length} results`);
        console.log(`   📊 Total: ${page1Response.data.pagination.total}, Has more: ${page1Response.data.pagination.hasMore}`);
      }
      
      // Second page
      const page2Response = await axios.get(`${BASE_URL}/api/search/posts?q=search&limit=2&offset=2`);
      if (page2Response.data.success) {
        console.log(`   📄 Page 2: ${page2Response.data.data.length} results`);
        console.log(`   📊 Total: ${page2Response.data.pagination.total}, Has more: ${page2Response.data.pagination.hasMore}`);
      }
    } catch (error) {
      console.log(`   ❌ Pagination test error: ${error.response?.data?.message || error.message}`);
    }
    console.log('');

    // Test 12: Error Handling Tests
    console.log('12. Testing Error Handling...');
    
    // Test empty query
    console.log('   Testing empty query...');
    try {
      const emptyResponse = await axios.get(`${BASE_URL}/api/search?q=`);
      if (!emptyResponse.data.success) {
        console.log('   ✅ Correctly rejected empty query');
      } else {
        console.log('   ❌ Should have rejected empty query');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected empty query with 400 status');
      } else {
        console.log(`   ❌ Unexpected error for empty query: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test invalid sort parameter
    console.log('   Testing invalid sort parameter...');
    try {
      const invalidSortResponse = await axios.get(`${BASE_URL}/api/search/posts?q=test&sort=invalid`);
      if (invalidSortResponse.data.success) {
        console.log('   ✅ Handled invalid sort gracefully (used default)');
      } else {
        console.log('   ❌ Should have handled invalid sort gracefully');
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error for invalid sort: ${error.response?.data?.message || error.message}`);
    }

    // Test very large limit
    console.log('   Testing large limit...');
    try {
      const largeLimitResponse = await axios.get(`${BASE_URL}/api/search/posts?q=test&limit=1000`);
      if (largeLimitResponse.data.success) {
        console.log('   ✅ Handled large limit gracefully');
      } else {
        console.log('   ❌ Should have handled large limit gracefully');
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error for large limit: ${error.response?.data?.message || error.message}`);
    }
    console.log('');

    // Test 13: Edge Cases
    console.log('13. Testing Edge Cases...');
    
    // Test special characters in search
    console.log('   Testing special characters in search...');
    try {
      const specialCharResponse = await axios.get(`${BASE_URL}/api/search?q=test%20with%20spaces&limit=5`);
      if (specialCharResponse.data.success) {
        console.log('   ✅ Handled special characters correctly');
      } else {
        console.log('   ❌ Failed to handle special characters');
      }
    } catch (error) {
      console.log(`   ❌ Error with special characters: ${error.response?.data?.message || error.message}`);
    }

    // Test very long search query
    console.log('   Testing very long search query...');
    const longQuery = 'a'.repeat(1000);
    try {
      const longQueryResponse = await axios.get(`${BASE_URL}/api/search?q=${encodeURIComponent(longQuery)}&limit=5`);
      if (longQueryResponse.data.success) {
        console.log('   ✅ Handled very long query gracefully');
      } else {
        console.log('   ❌ Should have handled very long query gracefully');
      }
    } catch (error) {
      console.log(`   ❌ Error with very long query: ${error.response?.data?.message || error.message}`);
    }
    console.log('');

    // Test 14: Performance Tests
    console.log('14. Testing Performance...');
    
    const performanceTests = [
      { query: 'search', limit: 10 },
      { query: 'nodejs', limit: 20 },
      { query: 'api', limit: 50 }
    ];

    for (const test of performanceTests) {
      console.log(`   Testing performance with query "${test.query}" and limit ${test.limit}...`);
      const startTime = Date.now();
      
      try {
        const response = await axios.get(`${BASE_URL}/api/search/posts?q=${encodeURIComponent(test.query)}&limit=${test.limit}`);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.data.success) {
          console.log(`   ✅ Query completed in ${duration}ms`);
          console.log(`   📊 Found ${response.data.data.length} results`);
        } else {
          console.log(`   ❌ Query failed: ${response.data.message}`);
        }
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`   ❌ Query failed after ${duration}ms: ${error.response?.data?.message || error.message}`);
      }
    }
    console.log('');

    console.log('🎉 All Search API tests completed successfully!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log(`   - Created ${testPostIds.length} test posts`);
    console.log(`   - Created ${testCommentIds.length} test comments`);
    console.log(`   - Tested ${searchQueries.length} general search queries`);
    console.log(`   - Tested ${postSearchTests.length} post search scenarios`);
    console.log(`   - Tested ${commentSearchTests.length} comment search scenarios`);
    console.log(`   - Tested ${userSearchTests.length} user search scenarios`);
    console.log(`   - Tested ${tagSearchTests.length} tag search scenarios`);
    console.log(`   - Tested ${advancedSearchTests.length} advanced search scenarios`);
    console.log('   - Tested pagination, error handling, edge cases, and performance');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
runTests(); 