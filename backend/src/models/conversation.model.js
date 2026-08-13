import db from '../config/database.js';

export const ConversationModel = {
  findById: async (id) => {
    const result = await db.query(
      `SELECT c.*, 
              client.fullname AS client_name, client.email AS client_email,
              agent.fullname AS agent_name, agent.email AS agent_email
       FROM conversations c
       LEFT JOIN users client ON c.clientid = client.id
       LEFT JOIN users agent ON c.agentid = agent.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  findByClientId: async (clientId) => {
    const result = await db.query(
      `SELECT c.*, 
              client.fullname AS client_name, client.email AS client_email,
              agent.fullname AS agent_name, agent.email AS agent_email
       FROM conversations c
       LEFT JOIN users client ON c.clientid = client.id
       LEFT JOIN users agent ON c.agentid = agent.id
       WHERE c.clientid = $1
       ORDER BY c.createdat DESC`,
      [clientId]
    );
    return result.rows;
  },

  findAllForAgent: async () => {
    const result = await db.query(
      `SELECT c.*, 
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
         c.createdat DESC`
    );
    return result.rows;
  },

  createConversation: async (clientId, subject) => {
    const result = await db.query(
      `INSERT INTO conversations (subject, status, clientid, agentid, createdat)
       VALUES ($1, 'pending', $2, NULL, NOW())
       RETURNING id, subject, status, clientid, agentid, createdat, closedat`,
      [subject.trim(), clientId]
    );
    return result.rows[0];
  },

  joinConversation: async (conversationId, agentId) => {
    const result = await db.query(
      `UPDATE conversations
       SET agentid = $1, status = 'in_progress'
       WHERE id = $2
       RETURNING *`,
      [agentId, conversationId]
    );
    return result.rows[0] || null;
  },

  closeConversation: async (conversationId, agentId) => {
    const result = await db.query(
      `UPDATE conversations
       SET status = 'closed', closedat = NOW(), agentid = COALESCE(agentid, $1)
       WHERE id = $2
       RETURNING id, subject, status, clientid, agentid, createdat, closedat`,
      [agentId, conversationId]
    );
    return result.rows[0] || null;
  },
};

export default ConversationModel;
