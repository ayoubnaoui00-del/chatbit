import db from '../config/database.js';

export const UserModel = {
  findByEmail: async (email) => {
    const result = await db.query(
      'SELECT id, fullname, email, passwordhash, role, isonline, createdat FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const result = await db.query(
      'SELECT id, fullname, email, role, isonline, createdat FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  create: async ({ fullname, email, passwordhash, role = 'client' }) => {
    const result = await db.query(
      `INSERT INTO users (fullname, email, passwordhash, role, isonline, createdat)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING id, fullname, email, role, isonline, createdat`,
      [fullname.trim(), email.toLowerCase().trim(), passwordhash, role]
    );
    return result.rows[0];
  },

  updateOnlineStatus: async (userId, isOnline) => {
    const result = await db.query(
      'UPDATE users SET isonline = $1 WHERE id = $2 RETURNING id, isonline',
      [isOnline, userId]
    );
    return result.rows[0] || null;
  },
};

export default UserModel;
