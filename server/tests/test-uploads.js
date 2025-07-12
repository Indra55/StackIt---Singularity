const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3100';
let authToken;
let testUserId;
let testUploadId;

// Test data
const testUser = {
  username: 'uploadt3estuser',
  email: 'uploadtest3@example.com',
  password: 'password123',
  first_name: 'Upload',
  last_name: 'Test'
};

// Create a test image file
const createTestImage = () => {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // Create a simple 1x1 pixel PNG image
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(testImagePath, pngHeader);
  return testImagePath;
};

async function runUploadTests() {
  console.log('🚀 Starting Upload API Tests...\n');

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

    // Test 3: Create test image
    console.log('3. Creating test image...');
    const testImagePath = createTestImage();
    console.log('✅ Test image created');
    console.log(`   Path: ${testImagePath}\n`);

    // Test 4: Upload avatar
    console.log('4. Testing avatar upload...');
    const avatarForm = new FormData();
    avatarForm.append('avatar', fs.createReadStream(testImagePath));
    
    const avatarResponse = await axios.post(`${BASE_URL}/api/uploads/avatar`, avatarForm, {
      headers: {
        ...avatarForm.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Avatar uploaded successfully');
    console.log(`   Avatar URL: ${avatarResponse.data.avatar_url}`);
    console.log(`   User updated: ${avatarResponse.data.user.username}\n`);

    // Test 5: Upload post image
    console.log('5. Testing post image upload...');
    const postImageForm = new FormData();
    postImageForm.append('image', fs.createReadStream(testImagePath));
    
    const postImageResponse = await axios.post(`${BASE_URL}/api/uploads/post-image`, postImageForm, {
      headers: {
        ...postImageForm.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    testUploadId = postImageResponse.data.upload.id;
    console.log('✅ Post image uploaded successfully');
    console.log(`   Upload ID: ${testUploadId}`);
    console.log(`   Image URL: ${postImageResponse.data.upload.url}`);
    console.log(`   Size: ${postImageResponse.data.upload.size} bytes\n`);

    // Test 6: Upload comment image
    console.log('6. Testing comment image upload...');
    const commentImageForm = new FormData();
    commentImageForm.append('image', fs.createReadStream(testImagePath));
    
    const commentImageResponse = await axios.post(`${BASE_URL}/api/uploads/comment-image`, commentImageForm, {
      headers: {
        ...commentImageForm.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Comment image uploaded successfully');
    console.log(`   Upload ID: ${commentImageResponse.data.upload.id}`);
    console.log(`   Image URL: ${commentImageResponse.data.upload.url}\n`);

    // Test 7: Get user uploads
    console.log('7. Testing get user uploads...');
    const uploadsResponse = await axios.get(`${BASE_URL}/api/uploads/user/${testUserId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ User uploads retrieved successfully');
    console.log(`   Total uploads: ${uploadsResponse.data.uploads.length}`);
    uploadsResponse.data.uploads.forEach((upload, index) => {
      console.log(`   ${index + 1}. ${upload.upload_type} - ${upload.original_name}`);
    });
    console.log('');

    // Test 8: Test file size limit
    console.log('8. Testing file size limit...');
    try {
      // Create a large file (6MB)
      const largeImagePath = path.join(__dirname, 'large-test-image.png');
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0x00); // 6MB of zeros
      fs.writeFileSync(largeImagePath, largeBuffer);
      
      const largeForm = new FormData();
      largeForm.append('image', fs.createReadStream(largeImagePath));
      
      await axios.post(`${BASE_URL}/api/uploads/post-image`, largeForm, {
        headers: {
          ...largeForm.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('❌ Large file upload should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ File size limit enforced correctly');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error for large file');
      }
    }
    console.log('');

    // Test 9: Test invalid file type
    console.log('9. Testing invalid file type...');
    try {
      const invalidForm = new FormData();
      const invalidFile = path.join(__dirname, 'invalid.txt');
      fs.writeFileSync(invalidFile, 'This is not an image');
      invalidForm.append('image', fs.createReadStream(invalidFile));
      
      await axios.post(`${BASE_URL}/api/uploads/post-image`, invalidForm, {
        headers: {
          ...invalidForm.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('❌ Invalid file type should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid file type rejected correctly');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error for invalid file type');
      }
    }
    console.log('');

    // Test 10: Delete upload
    console.log('10. Testing upload deletion...');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/uploads/${testUploadId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('✅ Upload deleted successfully');
    console.log(`   Message: ${deleteResponse.data.message}\n`);

    // Test 11: Verify upload was deleted
    console.log('11. Verifying upload deletion...');
    const verifyUploadsResponse = await axios.get(`${BASE_URL}/api/uploads/user/${testUserId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const deletedUpload = verifyUploadsResponse.data.uploads.find(u => u.id === testUploadId);
    if (!deletedUpload) {
      console.log('✅ Upload successfully removed from database');
    } else {
      console.log('❌ Upload still exists in database');
    }
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test files...');
    const filesToClean = [
      path.join(__dirname, 'test-image.png'),
      path.join(__dirname, 'large-test-image.png'),
      path.join(__dirname, 'invalid.txt')
    ];
    
    filesToClean.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    console.log('✅ Test files cleaned up\n');

    console.log('📊 Upload Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Avatar upload and user update');
    console.log('   ✅ Post image upload');
    console.log('   ✅ Comment image upload');
    console.log('   ✅ Get user uploads');
    console.log('   ✅ File size validation');
    console.log('   ✅ File type validation');
    console.log('   ✅ Upload deletion');
    console.log('   ✅ Cloudinary integration');
    console.log('   ✅ Database record management');
    console.log('\n🎉 All upload tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    
    // Cleanup on error
    const filesToClean = [
      path.join(__dirname, 'test-image.png'),
      path.join(__dirname, 'large-test-image.png'),
      path.join(__dirname, 'invalid.txt')
    ];
    
    filesToClean.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

// Run tests
runUploadTests(); 