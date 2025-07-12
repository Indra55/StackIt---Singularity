const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');
const { uploadImage, deleteImage, getAvatarUrl } = require('../config/cloudinaryConfig');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file per upload
  }
});

// Helper function to clean up temporary files
const cleanupTempFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// POST /api/uploads/avatar - Upload user avatar
router.post('/avatar', authenticateToken, requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(file, 'stackit/avatars');
    
    if (!cloudinaryResult.success) {
      cleanupTempFile(file.path);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to Cloudinary',
        error: cloudinaryResult.error
      });
    }

    // Get optimized avatar URL
    const avatarUrl = getAvatarUrl(cloudinaryResult.public_id);

    // Update user's avatar in database
    const updateQuery = `
      UPDATE users 
      SET avatar_url = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, username, avatar_url
    `;
    
    const updateResult = await pool.query(updateQuery, [avatarUrl, userId]);

    // Save upload record
    const uploadQuery = `
      INSERT INTO uploads (user_id, filename, original_name, mime_type, file_size, file_path, upload_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;
    
    await pool.query(uploadQuery, [
      userId,
      cloudinaryResult.public_id,
      file.originalname,
      file.mimetype,
      cloudinaryResult.size,
      cloudinaryResult.url,
      'avatar'
    ]);

    // Clean up temporary file
    cleanupTempFile(file.path);

    res.json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl,
      user: updateResult.rows[0]
    });

  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
});

// POST /api/uploads/post-image - Upload image for posts
router.post('/post-image', authenticateToken, requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(file, 'stackit/posts');
    
    if (!cloudinaryResult.success) {
      cleanupTempFile(file.path);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to Cloudinary',
        error: cloudinaryResult.error
      });
    }

    // Save upload record
    const uploadQuery = `
      INSERT INTO uploads (user_id, filename, original_name, mime_type, file_size, file_path, upload_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, file_path
    `;
    
    const uploadResult = await pool.query(uploadQuery, [
      userId,
      cloudinaryResult.public_id,
      file.originalname,
      file.mimetype,
      cloudinaryResult.size,
      cloudinaryResult.url,
      'post_image'
    ]);

    // Clean up temporary file
    cleanupTempFile(file.path);

    res.json({
      status: 'success',
      message: 'Image uploaded successfully',
      upload: {
        id: uploadResult.rows[0].id,
        url: uploadResult.rows[0].file_path,
        filename: cloudinaryResult.public_id,
        size: cloudinaryResult.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      }
    });

  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    
    console.error('Post image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// POST /api/uploads/comment-image - Upload image for comments
router.post('/comment-image', authenticateToken, requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Upload to Cloudinary
    const cloudinaryResult = await uploadImage(file, 'stackit/comments');
    
    if (!cloudinaryResult.success) {
      cleanupTempFile(file.path);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload image to Cloudinary',
        error: cloudinaryResult.error
      });
    }

    // Save upload record
    const uploadQuery = `
      INSERT INTO uploads (user_id, filename, original_name, mime_type, file_size, file_path, upload_type, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, file_path
    `;
    
    const uploadResult = await pool.query(uploadQuery, [
      userId,
      cloudinaryResult.public_id,
      file.originalname,
      file.mimetype,
      cloudinaryResult.size,
      cloudinaryResult.url,
      'comment_image'
    ]);

    // Clean up temporary file
    cleanupTempFile(file.path);

    res.json({
      status: 'success',
      message: 'Image uploaded successfully',
      upload: {
        id: uploadResult.rows[0].id,
        url: uploadResult.rows[0].file_path,
        filename: cloudinaryResult.public_id,
        size: cloudinaryResult.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height
      }
    });

  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      cleanupTempFile(req.file.path);
    }
    
    console.error('Comment image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// GET /api/uploads/user/:userId - Get user's uploads
router.get('/user/:userId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;

    // Users can only see their own uploads or public uploads
    const query = `
      SELECT id, filename, original_name, mime_type, file_size, file_path, upload_type, created_at
      FROM uploads 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);

    res.json({
      status: 'success',
      uploads: result.rows
    });

  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch uploads',
      error: error.message
    });
  }
});

// DELETE /api/uploads/:uploadId - Delete an upload
router.delete('/:uploadId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const uploadId = req.params.uploadId;
    const userId = req.user.id;

    // Get upload details
    const getQuery = `
      SELECT * FROM uploads 
      WHERE id = $1 AND user_id = $2
    `;
    
    const uploadResult = await pool.query(getQuery, [uploadId, userId]);
    
    if (uploadResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found or access denied'
      });
    }

    const upload = uploadResult.rows[0];

    // Delete from Cloudinary
    const deleteResult = await deleteImage(upload.filename);
    
    if (!deleteResult.success) {
      console.error('Failed to delete from Cloudinary:', deleteResult.error);
    }

    // Delete from database
    await pool.query('DELETE FROM uploads WHERE id = $1', [uploadId]);

    res.json({
      status: 'success',
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete upload',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Only one file allowed.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

  next(error);
});

module.exports = router; 