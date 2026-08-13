import db from '../config/database.js';

export const MessageModel = {
  findByConversationId: async (conversationId, limit = 20, offset = 0) => {
    const result = await db.query(
      `SELECT 
         m.id, m.conversationid, m.senderid, m.content, m.isread, m.sentat,
         u.fullname AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.senderid = u.id
       WHERE m.conversationid = $1
       ORDER BY m.sentat ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows;
  },

  countByConversationId: async (conversationId) => {
    const result = await db.query(
      'SELECT COUNT(*) AS total FROM messages WHERE conversationid = $1',
      [conversationId]
    );
    return parseInt(result.rows[0].total, 10);
  },

  sendMessage: async (conversationId, senderId, content) => {
    const result = await db.query(
      `INSERT INTO messages (conversationid, senderid, content, isread, sentat)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING id, conversationid, senderid, content, isread, sentat`,
      [conversationId, senderId, content.trim()]
    );
    return result.rows[0];
  },

  markAsRead: async (messageId) => {
    const result = await db.query(
      'UPDATE messages SET isread = true WHERE id = $1 RETURNING *',
      [messageId]
    );
    return result.rows[0] || null;
  },
};

export default MessageModel;
