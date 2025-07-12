const pool = require('../config/dbConfig');

// Check if user is moderator or admin of a community
const isModerator = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const communityName = req.params.name || req.params.communityName;
    
    if (!communityName) {
      return res.status(400).json({
        status: 'error',
        message: 'Community name is required'
      });
    }

    // Get community and check user's role
    const query = `
      SELECT c.id, c.name, cm.role
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id
      WHERE c.name = $1 AND cm.user_id = $2
    `;
    
    const result = await pool.query(query, [communityName, userId]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this community'
      });
    }
    
    const { role } = result.rows[0];
    
    if (role !== 'moderator' && role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Moderator privileges required'
      });
    }
    
    // Add community info to request
    req.community = result.rows[0];
    req.userRole = role;
    next();
  } catch (error) {
    console.error('Moderator check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify moderator status',
      error: error.message
    });
  }
};

// Check if user is admin of a community
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const communityName = req.params.name || req.params.communityName;
    
    if (!communityName) {
      return res.status(400).json({
        status: 'error',
        message: 'Community name is required'
      });
    }

    // Get community and check user's role
    const query = `
      SELECT c.id, c.name, cm.role
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id
      WHERE c.name = $1 AND cm.user_id = $2
    `;
    
    const result = await pool.query(query, [communityName, userId]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this community'
      });
    }
    
    const { role } = result.rows[0];
    
    if (role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin privileges required'
      });
    }
    
    // Add community info to request
    req.community = result.rows[0];
    req.userRole = role;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify admin status',
      error: error.message
    });
  }
};

// Check if user is banned from community
const checkBanStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const communityName = req.params.name || req.params.communityName;
    
    if (!communityName) {
      return next(); // Skip check if no community specified
    }

    // Check if user is banned
    const query = `
      SELECT cb.*, c.name as community_name
      FROM community_bans cb
      JOIN communities c ON cb.community_id = c.id
      WHERE c.name = $1 AND cb.user_id = $2
      AND (cb.expires_at IS NULL OR cb.expires_at > NOW())
    `;
    
    const result = await pool.query(query, [communityName, userId]);
    
    if (result.rows.length > 0) {
      const ban = result.rows[0];
      return res.status(403).json({
        status: 'error',
        message: `You are banned from r/${ban.community_name}`,
        ban: {
          reason: ban.reason,
          banned_at: ban.banned_at,
          expires_at: ban.expires_at,
          is_permanent: ban.expires_at === null
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Ban check error:', error);
    next(); // Continue on error
  }
};

module.exports = {
  isModerator,
  isAdmin,
  checkBanStatus
}; 