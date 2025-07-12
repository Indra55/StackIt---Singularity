const express = require('express');
const router = express.Router();
const pool = require('../config/dbConfig');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Utility: Create a notification
async function createNotification({ user_id, type, title, message, related_id, related_type }) {
  const allowedTypes = ['mention', 'answer', 'vote', 'comment', 'chat']; // Now allow 'chat' as well
  if (!allowedTypes.includes(type)) {
    console.log('[DEBUG] Invalid notification type:', type);
    throw new Error('Invalid notification type: ' + type);
  }
  console.log('[DEBUG] createNotification called with:', { user_id, type, title, message, related_id, related_type });
  const query = `
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
    RETURNING *
  `;
  const values = [user_id, type, title, message, related_id, related_type];
  try {
    const { rows } = await pool.query(query, values);
    const notification = rows[0];
    console.log('[DEBUG] Notification inserted:', notification);
    // Real-time: emit notification if user is online
    try {
      const app = require('../server');
      if (app && app.get && app.get('sendNotificationToUser')) {
        app.get('sendNotificationToUser')(user_id, notification);
        console.log('[DEBUG] Real-time notification emitted to user:', user_id);
      }
    } catch (e) {
      console.log('[DEBUG] Real-time emit failed:', e);
    }
    return notification;
  } catch (err) {
    console.log('[DEBUG] Notification DB insert error:', err);
    throw err;
  }
}

// GET /api/notifications - Get all notifications for the logged-in user
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ status: 'success', notifications: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications', error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', authenticateToken, requireAuth, async (req, res) => {
  try {
    const notifId = req.params.id;
    const { rowCount, rows } = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [notifId, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }
    res.json({ status: 'success', notification: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to mark as read', error: err.message });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to mark all as read', error: err.message });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const notifId = req.params.id;
    const { rowCount } = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notifId, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }
    res.json({ status: 'success', message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete notification', error: err.message });
  }
});

// GET /api/notifications/count - Get unread notification count
router.get('/count', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ status: 'success', count: parseInt(rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get unread count', error: err.message });
  }
});

module.exports = router;
module.exports.createNotification = createNotification; 