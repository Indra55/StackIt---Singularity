const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    credentials: true
  }
});
const { verifyToken, getUserById } = require('./config/jwtConfig');
const { createNotification } = require('./routes/notifications');
const pool = require('./config/dbConfig');

require("dotenv").config()

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true
}))

// Parse JSON bodies
app.use(express.json()) 
app.use(express.urlencoded({extended:false})) 

app.use("/", require("./routes/index"))
app.use("/users",require("./routes/users"))
app.use("/",require("./routes/posts"))
app.use("/api/notifications", require("./routes/notifications"))
app.use("/api/chats", require("./routes/chats"))
app.use("/api/uploads", require("./routes/uploads"))
app.use("/api/communities", require("./routes/communities"))
app.use("/api/admin", require("./routes/admin"))
app.use('/api/mentions', require('./routes/mentionRoutes'))
app.use('/api/search', require('./routes/search'))

// Map userId to socketId(s)
const userSocketMap = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) return next(new Error('Authentication error: No token'));
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Authentication error: Invalid token'));
    const user = await getUserById(decoded.id);
    if (!user) return next(new Error('Authentication error: User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
  userSocketMap.get(userId).add(socket.id);

  // Real-time chat message event
  socket.on('chat:message', async ({ chatId, content }, callback) => {
    try {
      if (!content || !chatId) return callback && callback({ status: 'error', message: 'Invalid data' });
      // Check if user is participant
      const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
      if (chatRes.rows.length === 0) {
        return callback && callback({ status: 'error', message: 'Not a participant in this chat' });
      }
      const chat = chatRes.rows[0];
      // Insert message
      const insertQuery = `INSERT INTO messages (chat_id, sender_id, content, is_read, created_at) VALUES ($1, $2, $3, false, NOW()) RETURNING *`;
      const { rows } = await pool.query(insertQuery, [chatId, userId, content]);
      const message = rows[0];
      // Determine recipient
      const recipientId = (chat.user1_id === userId) ? chat.user2_id : chat.user1_id;
      // Emit to recipient if online
      const sockets = userSocketMap.get(recipientId);
      if (sockets) {
        for (const socketId of sockets) {
          io.to(socketId).emit('chat:message', message);
        }
      }
      // Emit to sender for confirmation
      socket.emit('chat:message', message);
      // Create notification for recipient
      console.log('[DEBUG] About to create notification for chat message:', {
        recipientId, chatId, sender: socket.user.username
      });
      await createNotification({
        user_id: recipientId,
        type: 'chat',
        title: 'New Message',
        message: `${socket.user.username} sent you a message`,
        related_id: chatId,
        related_type: 'chat'
      });
      callback && callback({ status: 'success', message });
    } catch (err) {
      console.log('[DEBUG] chat:message error:', err);
      callback && callback({ status: 'error', message: err.message });
    }
  });

  // Real-time read receipts
  socket.on('chat:read', async ({ chatId, messageIds, upToMessageId }) => {
    try {
      // Check if user is participant
      const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
      if (chatRes.rows.length === 0) return;
      const chat = chatRes.rows[0];
      // Update messages as read
      if (Array.isArray(messageIds) && messageIds.length > 0) {
        await pool.query('UPDATE messages SET is_read = true WHERE chat_id = $1 AND id = ANY($2::int[]) AND sender_id != $3', [chatId, messageIds, userId]);
      } else if (upToMessageId) {
        await pool.query('UPDATE messages SET is_read = true WHERE chat_id = $1 AND id <= $2 AND sender_id != $3', [chatId, upToMessageId, userId]);
      }
      // Notify other participant
      const recipientId = (chat.user1_id === userId) ? chat.user2_id : chat.user1_id;
      const sockets = userSocketMap.get(recipientId);
      if (sockets) {
        for (const socketId of sockets) {
          io.to(socketId).emit('chat:read', { chatId, messageIds, upToMessageId, readerId: userId });
        }
      }
    } catch (err) {}
  });

  // Typing indicator
  socket.on('chat:typing', async ({ chatId }) => {
    try {
      // Check if user is participant
      const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
      if (chatRes.rows.length === 0) return;
      const chat = chatRes.rows[0];
      const recipientId = (chat.user1_id === userId) ? chat.user2_id : chat.user1_id;
      const sockets = userSocketMap.get(recipientId);
      if (sockets) {
        for (const socketId of sockets) {
          io.to(socketId).emit('chat:typing', { chatId, userId });
        }
      }
    } catch (err) {}
  });

  socket.on('chat:stop_typing', async ({ chatId }) => {
    try {
      // Check if user is participant
      const chatRes = await pool.query('SELECT * FROM chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)', [chatId, userId]);
      if (chatRes.rows.length === 0) return;
      const chat = chatRes.rows[0];
      const recipientId = (chat.user1_id === userId) ? chat.user2_id : chat.user1_id;
      const sockets = userSocketMap.get(recipientId);
      if (sockets) {
        for (const socketId of sockets) {
          io.to(socketId).emit('chat:stop_typing', { chatId, userId });
        }
      }
    } catch (err) {}
  });

  socket.on('disconnect', () => {
    if (userSocketMap.has(userId)) {
      userSocketMap.get(userId).delete(socket.id);
      if (userSocketMap.get(userId).size === 0) userSocketMap.delete(userId);
    }
  });
});

function sendNotificationToUser(userId, notification) {
  const sockets = userSocketMap.get(userId);
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit('notification:new', notification);
    }
  }
}

app.set('io', io);
app.set('sendNotificationToUser', sendNotificationToUser);

const PORT = process.env.PORT || 3100;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));