import db from '../config/database.js';

export const getConversations = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let queryText = '';
    let queryParams = [];

    if (role === 'client') {
      queryText = `
        SELECT 
          c.id, c.subject, c.status, c.clientid, c.agentid, c.createdat, c.closedat,
          client.fullname AS client_name, client.email AS client_email,
          agent.fullname AS agent_name, agent.email AS agent_email
        FROM conversations c
        LEFT JOIN users client ON c.clientid = client.id
        LEFT JOIN users agent ON c.agentid = agent.id
        WHERE c.clientid = $1
        ORDER BY c.createdat DESC
      `;
      queryParams = [userId];
    } else {
      queryText = `
        SELECT 
          c.id, c.subject, c.status, c.clientid, c.agentid, c.createdat, c.closedat,
          client.fullname AS client_name, client.email AS client_email,
          agent.fullname AS agent_name, agent.email AS agent_email
        FROM conversations c
        LEFT JOIN users client ON c.clientid = client.id
        LEFT JOIN users agent ON c.agentid = agent.id
        ORDER BY 
          CASE 
            WHEN c.status = 'pending' THEN 1
            WHEN c.status = 'in_progress' THEN 2
            ELSE 3
          END,
          c.createdat DESC
      `;
      queryParams = [];
    }

    const result = await db.query(queryText, queryParams);

    return res.status(200).json({
      success: true,
      data: {
        conversations: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { id: clientId, role } = req.user;

    if (role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can create support conversations',
      });
    }

    const { subject } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Conversation subject is required',
      });
    }

    const result = await db.query(
      `INSERT INTO conversations (subject, status, clientid, agentid, createdat)
       VALUES ($1, 'pending', $2, NULL, NOW())
       RETURNING id, subject, status, clientid, agentid, createdat, closedat`,
      [subject.trim(), clientId]
    );

    const conversation = result.rows[0];

    const io = req.app.get('io');
    if (io) {
      io.emit('conversation:updated', {
        action: 'created',
        conversation: {
          ...conversation,
          client_name: req.user.fullname,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const { id: userId, role } = req.user;

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const convResult = await db.query(
      'SELECT id, clientid, agentid, status FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const conversation = convResult.rows[0];

    if (role === 'client' && conversation.clientid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have access to this conversation',
      });
    }

    const countResult = await db.query(
      'SELECT COUNT(*) AS total FROM messages WHERE conversationid = $1',
      [conversationId]
    );
    const totalMessages = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalMessages / limit) || 1;

    const messagesResult = await db.query(
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

    return res.status(200).json({
      success: true,
      data: {
        page,
        limit,
        totalMessages,
        totalPages,
        messages: messagesResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const closeConversation = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const { id: agentId, role } = req.user;

    if (role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only support agents can close conversations',
      });
    }

    if (isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    const convResult = await db.query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const currentConv = convResult.rows[0];

    if (currentConv.status === 'closed' || currentConv.closedat !== null) {
      return res.status(400).json({
        success: false,
        message: 'Conversation is already closed',
        data: {
          conversation: currentConv,
        },
      });
    }

    const updateResult = await db.query(
      `UPDATE conversations
       SET status = 'closed', closedat = NOW(), agentid = COALESCE(agentid, $1)
       WHERE id = $2
       RETURNING id, subject, status, clientid, agentid, createdat, closedat`,
      [agentId, conversationId]
    );

    const updatedConversation = updateResult.rows[0];

    const io = req.app.get('io');
    if (io) {
      const room = String(conversationId);
      io.to(room).emit('conversation:updated', {
        action: 'closed',
        conversation: updatedConversation,
        message: 'This conversation has been closed by the support agent.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation closed successfully',
      data: {
        conversation: updatedConversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getConversations,
  createConversation,
  getConversationMessages,
  closeConversation,
};
