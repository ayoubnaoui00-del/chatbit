import db from '../config/database.js';

export const registerChatSocket = (io) => {
  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`👤 User connected: ${user.fullname} (ID: ${user.id}, Role: ${user.role})`);

    try {
      await db.query('UPDATE users SET isonline = TRUE WHERE id = $1', [user.id]);
      io.emit('presence:update', {
        userId: user.id,
        fullname: user.fullname,
        role: user.role,
        isOnline: true,
      });
    } catch (error) {
      console.error('Error updating online presence on connect:', error.message);
    }

    socket.on('conversation:join', async (data) => {
      try {
        const conversationId = parseInt(data?.conversationId, 10);

        if (isNaN(conversationId)) {
          return socket.emit('error', { message: 'Invalid conversationId' });
        }

        const convResult = await db.query(
          'SELECT * FROM conversations WHERE id = $1',
          [conversationId]
        );

        if (convResult.rows.length === 0) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        let conversation = convResult.rows[0];

        if (user.role === 'client' && conversation.clientid !== user.id) {
          return socket.emit('error', {
            message: 'Unauthorized: You are not a participant in this conversation',
          });
        }

        if (user.role === 'agent' && conversation.status === 'pending' && !conversation.agentid) {
          const updateResult = await db.query(
            `UPDATE conversations 
             SET agentid = $1, status = 'in_progress' 
             WHERE id = $2 
             RETURNING *`,
            [user.id, conversationId]
          );
          conversation = updateResult.rows[0];

          io.emit('conversation:updated', {
            action: 'assigned',
            conversation: {
              ...conversation,
              agent_name: user.fullname,
            },
          });
        }

        const roomName = String(conversationId);
        socket.join(roomName);

        console.log(`📥 User ${user.fullname} (ID: ${user.id}) joined room: ${roomName}`);
        socket.emit('conversation:joined', { conversationId });
      } catch (error) {
        console.error('Error in conversation:join:', error.message);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('conversation:leave', (data) => {
      const conversationId = parseInt(data?.conversationId, 10);
      if (!isNaN(conversationId)) {
        const roomName = String(conversationId);
        socket.leave(roomName);
        console.log(`📤 User ${user.fullname} left room: ${roomName}`);
      }
    });

    socket.on('message:send', async (data) => {
      try {
        const conversationId = parseInt(data?.conversationId, 10);
        const content = data?.content;

        if (isNaN(conversationId) || !content || !content.trim()) {
          return socket.emit('error', {
            message: 'Valid conversationId and non-empty content are required',
          });
        }

        const convResult = await db.query(
          'SELECT * FROM conversations WHERE id = $1',
          [conversationId]
        );

        if (convResult.rows.length === 0) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const conversation = convResult.rows[0];

        if (conversation.status === 'closed' || conversation.closedat !== null) {
          return socket.emit('error', {
            message: 'Cannot send message to a closed conversation',
          });
        }

        if (user.role === 'client' && conversation.clientid !== user.id) {
          return socket.emit('error', {
            message: 'Unauthorized: You are not a participant in this conversation',
          });
        }

        const insertResult = await db.query(
          `INSERT INTO messages (conversationid, senderid, content, isread, sentat)
           VALUES ($1, $2, $3, false, NOW())
           RETURNING id, conversationid, senderid, content, isread, sentat`,
          [conversationId, user.id, content.trim()]
        );

        const savedMessage = {
          ...insertResult.rows[0],
          sender_name: user.fullname,
          sender_role: user.role,
        };

        const roomName = String(conversationId);

        io.to(roomName).emit('message:new', savedMessage);
        console.log(`💬 Message saved & broadcast in room ${roomName} by ${user.fullname}`);
      } catch (error) {
        console.error('Error in message:send:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', (data) => {
      const conversationId = parseInt(data?.conversationId, 10);
      if (!isNaN(conversationId)) {
        const roomName = String(conversationId);
        socket.to(roomName).emit('typing:update', {
          conversationId,
          userId: user.id,
          fullname: user.fullname,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const conversationId = parseInt(data?.conversationId, 10);
      if (!isNaN(conversationId)) {
        const roomName = String(conversationId);
        socket.to(roomName).emit('typing:update', {
          conversationId,
          userId: user.id,
          fullname: user.fullname,
          isTyping: false,
        });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${user.fullname} (ID: ${user.id})`);
      try {
        await db.query('UPDATE users SET isonline = FALSE WHERE id = $1', [user.id]);
        io.emit('presence:update', {
          userId: user.id,
          fullname: user.fullname,
          role: user.role,
          isOnline: false,
        });
      } catch (error) {
        console.error('Error updating online presence on disconnect:', error.message);
      }
    });
  });
};

export default registerChatSocket;
